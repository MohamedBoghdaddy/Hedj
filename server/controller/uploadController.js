import mongoose from "mongoose";
import Product from "../model/productsmodel.js";
import User from "../model/usermodel.js";
import Employee from "../model/employeemodel.js";
import {
  uploadBufferToSupabase,
  deleteSupabaseFile,
  saveImageAssetMetadata,
  buildStoragePath,
} from "../services/supabaseStorageService.js";
import { isSupabaseConfigured } from "../config/supabase.js";
import { queueEmail } from "../services/emailOutboxService.js";
import { deliverEmail } from "../services/emailDeliveryService.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────────

const supabaseMissing = (res) =>
  res.status(503).json({ success: false, message: "Supabase storage is not configured." });

const invalidId = (res) =>
  res.status(400).json({ success: false, message: "Invalid ID format." });

const getBucketEnv = (type) => {
  const map = {
    product: process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images",
    user: process.env.SUPABASE_PROFILE_IMAGES_BUCKET || "profile-images",
    employee: process.env.SUPABASE_EMPLOYEE_IMAGES_BUCKET || "employee-images",
  };
  return map[type];
};

// ─── POST /api/admin/products/:productId/image ────────────────────────────────────

export const uploadProductImage = async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) return invalidId(res);

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided." });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const bucket = getBucketEnv("product");
  const storagePath = buildStoragePath("product", productId, req.file.originalname);
  let uploadResult;

  try {
    uploadResult = await uploadBufferToSupabase({
      bucket,
      path: storagePath,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }

  const assetRow = await saveImageAssetMetadata({
    mongoOwnerId: (req.employee?._id || req.user?._id)?.toString(),
    relatedEntityType: "product",
    relatedEntityId: productId,
    bucket,
    filePath: uploadResult.path,
    publicUrl: uploadResult.publicUrl,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
  });

  try {
    product.imageUrl = uploadResult.publicUrl;
    product.imageAssetId = assetRow?.id || null;
    await product.save();
  } catch (saveErr) {
    // Mongo update failed – mark Supabase asset orphaned (best-effort)
    await deleteSupabaseFile({ bucket, path: uploadResult.path }).catch(() => {});
    return res
      .status(500)
      .json({ success: false, message: "Image uploaded but failed to update product in MongoDB. Upload rolled back." });
  }

  return res.status(200).json({ success: true, product, imageUrl: uploadResult.publicUrl });
};

// ─── POST /api/admin/products/:productId/gallery ──────────────────────────────────

export const uploadProductGallery = async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) return invalidId(res);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No image files provided." });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  const bucket = getBucketEnv("product");
  const uploaded = [];

  for (const file of req.files) {
    try {
      const storagePath = buildStoragePath("product", productId, file.originalname);
      const result = await uploadBufferToSupabase({
        bucket,
        path: storagePath,
        buffer: file.buffer,
        contentType: file.mimetype,
      });

      const asset = await saveImageAssetMetadata({
        relatedEntityType: "product",
        relatedEntityId: productId,
        bucket,
        filePath: result.path,
        publicUrl: result.publicUrl,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      });

      uploaded.push({ url: result.publicUrl, assetId: asset?.id || null });
    } catch (err) {
      console.warn(`Gallery upload skipped for ${file.originalname}: ${err.message}`);
    }
  }

  if (uploaded.length === 0) {
    return res.status(500).json({ success: false, message: "All gallery uploads failed." });
  }

  product.galleryImages = [...(product.galleryImages || []), ...uploaded];
  await product.save();

  return res.status(200).json({ success: true, product, uploaded });
};

// ─── POST /api/users/me/profile-photo ────────────────────────────────────────────

export const uploadUserProfilePhoto = async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided." });
  }

  const userId = req.user._id.toString();
  const bucket = getBucketEnv("user");
  const storagePath = buildStoragePath("user", userId, req.file.originalname);

  let uploadResult;
  try {
    uploadResult = await uploadBufferToSupabase({
      bucket,
      path: storagePath,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }

  const assetRow = await saveImageAssetMetadata({
    mongoOwnerId: userId,
    relatedEntityType: "user",
    relatedEntityId: userId,
    bucket,
    filePath: uploadResult.path,
    publicUrl: uploadResult.publicUrl,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
  });

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePhotoUrl: uploadResult.publicUrl,
        profilePhotoAssetId: assetRow?.id || null,
      },
      { new: true }
    ).select("-password -__v");

    return res.status(200).json({ success: true, user, photoUrl: uploadResult.publicUrl });
  } catch (saveErr) {
    await deleteSupabaseFile({ bucket, path: uploadResult.path }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: "Photo uploaded but failed to update user in MongoDB. Upload rolled back.",
    });
  }
};

// ─── POST /api/admin/employees/:employeeId/profile-photo ─────────────────────────

export const uploadEmployeeProfilePhoto = async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  const { employeeId } = req.params;
  if (!mongoose.isValidObjectId(employeeId)) return invalidId(res);

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided." });
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

  const bucket = getBucketEnv("employee");
  const storagePath = buildStoragePath("employee", employeeId, req.file.originalname);

  let uploadResult;
  try {
    uploadResult = await uploadBufferToSupabase({
      bucket,
      path: storagePath,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }

  const assetRow = await saveImageAssetMetadata({
    mongoOwnerId: employeeId,
    relatedEntityType: "employee",
    relatedEntityId: employeeId,
    bucket,
    filePath: uploadResult.path,
    publicUrl: uploadResult.publicUrl,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
  });

  try {
    employee.profilePhotoUrl = uploadResult.publicUrl;
    employee.profilePhotoAssetId = assetRow?.id || null;
    await employee.save();
    return res.status(200).json({ success: true, employee, photoUrl: uploadResult.publicUrl });
  } catch (saveErr) {
    await deleteSupabaseFile({ bucket, path: uploadResult.path }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: "Photo uploaded but failed to update employee in MongoDB. Upload rolled back.",
    });
  }
};

// ─── POST /api/admin/employees/:employeeId/send-invite ────────────────────────────

export const sendEmployeeInvite = async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      success: false,
      status: "supabase_not_configured",
      message: "Supabase email outbox is not configured.",
    });
  }

  const { employeeId } = req.params;
  if (!mongoose.isValidObjectId(employeeId)) return invalidId(res);

  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const inviteUrl = `${frontendUrl}/accept-invite?employeeId=${employeeId}`;

  const subject = `You have been invited to join Hedj Commerce`;
  const bodyHtml = `
    <h2>Welcome to Hedj Commerce</h2>
    <p>Hi ${employee.fname},</p>
    <p>You have been invited as a <strong>${employee.role}</strong> in the
    <strong>${employee.department}</strong> department.</p>
    <p><a href="${inviteUrl}" style="padding:10px 20px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:4px;">Accept Invitation</a></p>
    <p>Or copy this link: ${inviteUrl}</p>
  `;
  const bodyText = `Hi ${employee.fname}, you have been invited to join Hedj Commerce as ${employee.role} in ${employee.department}. Accept at: ${inviteUrl}`;

  const outboxRow = await queueEmail({
    toEmail: employee.email,
    toName: `${employee.fname} ${employee.lname}`,
    subject,
    bodyHtml,
    bodyText,
    templateKey: "employee_invite",
    templateVariables: {
      name: employee.fname,
      role: employee.role,
      department: employee.department,
      inviteUrl,
    },
    relatedEntityType: "employee",
    relatedEntityId: employeeId,
  });

  const deliveryResult = await deliverEmail(outboxRow);

  // Map delivery status to employee field enum
  const invStatusMap = {
    sent: "sent",
    failed: "failed",
    queued: "provider_not_configured",
  };
  const invStatus = invStatusMap[deliveryResult.status] || "queued";

  employee.invitationEmailStatus = invStatus;
  employee.invitationEmailOutboxId = outboxRow.id;
  employee.invitedAt = new Date();
  await employee.save();

  return res.status(200).json({
    success: true,
    status: invStatus,
    message: deliveryResult.message || `Email ${deliveryResult.status}.`,
    outboxId: outboxRow.id,
    inviteUrl: invStatus === "provider_not_configured" ? inviteUrl : undefined,
    employee: { _id: employee._id, email: employee.email, invitationEmailStatus: invStatus },
  });
};

// ─── POST /api/admin/employees/invite (create + invite in one step) ───────────────
// Body: { fname, lname, email, department, role }

export const createAndInviteEmployee = async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      success: false,
      status: "supabase_not_configured",
      message: "Supabase email outbox is not configured.",
    });
  }

  const { fname, lname, email, department, role = "readonly" } = req.body;

  if (!fname || !lname || !email || !department) {
    return res.status(400).json({
      success: false,
      message: "fname, lname, email, and department are required.",
    });
  }

  // Create employee with a temporary random password (they set their own via invite link)
  const crypto = (await import("crypto")).default;
  const tempPassword = crypto.randomBytes(16).toString("hex");

  let employee;
  try {
    employee = await Employee.create({ fname, lname, email, department, role, password: tempPassword });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "An employee with this email already exists." });
    }
    return res.status(500).json({ success: false, message: `Failed to create employee: ${err.message}` });
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const inviteUrl = `${frontendUrl}/accept-invite?employeeId=${employee._id}`;

  const subject = `You have been invited to join Hedj Commerce`;
  const bodyHtml = `
    <h2>Welcome to Hedj Commerce</h2>
    <p>Hi ${fname},</p>
    <p>You have been invited as a <strong>${role}</strong> in the
    <strong>${department}</strong> department.</p>
    <p><a href="${inviteUrl}" style="padding:10px 20px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:4px;">Accept Invitation</a></p>
    <p>Or copy this link: ${inviteUrl}</p>
  `;
  const bodyText = `Hi ${fname}, you have been invited to join Hedj Commerce as ${role} in ${department}. Accept at: ${inviteUrl}`;

  const outboxRow = await queueEmail({
    toEmail: email,
    toName: `${fname} ${lname}`,
    subject,
    bodyHtml,
    bodyText,
    templateKey: "employee_invite",
    templateVariables: { name: fname, role, department, inviteUrl },
    relatedEntityType: "employee",
    relatedEntityId: employee._id.toString(),
  });

  const deliveryResult = await deliverEmail(outboxRow);

  const invStatusMap = {
    sent: "sent",
    failed: "failed",
    queued: "provider_not_configured",
  };
  const invStatus = invStatusMap[deliveryResult.status] || "queued";

  employee.invitationEmailStatus = invStatus;
  employee.invitationEmailOutboxId = outboxRow.id;
  employee.invitedAt = new Date();
  await employee.save();

  return res.status(201).json({
    success: true,
    status: invStatus,
    message: deliveryResult.message || `Invitation ${deliveryResult.status}.`,
    outboxId: outboxRow.id,
    inviteUrl: invStatus === "provider_not_configured" ? inviteUrl : undefined,
    employee: {
      _id: employee._id,
      fname: employee.fname,
      lname: employee.lname,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      invitationEmailStatus: invStatus,
    },
  });
};
