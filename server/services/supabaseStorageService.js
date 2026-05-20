import path from "path";
import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

// ─── Allowed MIME types per bucket ──────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Max bytes per bucket type
const MAX_SIZE_BYTES = {
  "product-images": 5 * 1024 * 1024,   // 5 MB
  "profile-images": 2 * 1024 * 1024,   // 2 MB
  "employee-images": 2 * 1024 * 1024,  // 2 MB
  "email-attachments": 10 * 1024 * 1024, // 10 MB
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────

export const sanitizeFileName = (fileName) =>
  path
    .basename(fileName)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 100);

const validateFile = (buffer, contentType, bucket) => {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw Object.assign(
      new Error(
        `Unsupported file type: ${contentType}. Allowed: ${[...ALLOWED_IMAGE_TYPES].join(", ")}`
      ),
      { statusCode: 415 }
    );
  }

  const maxBytes =
    MAX_SIZE_BYTES[bucket] ||
    (bucket === process.env.SUPABASE_PRODUCT_IMAGES_BUCKET ? MAX_SIZE_BYTES["product-images"] : null) ||
    (bucket === process.env.SUPABASE_PROFILE_IMAGES_BUCKET ? MAX_SIZE_BYTES["profile-images"] : null) ||
    (bucket === process.env.SUPABASE_EMPLOYEE_IMAGES_BUCKET ? MAX_SIZE_BYTES["employee-images"] : null);
  if (maxBytes && buffer.length > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
    throw Object.assign(
      new Error(`File too large. Max size for ${bucket} is ${maxMB} MB.`),
      { statusCode: 413 }
    );
  }
};

const requireSupabase = () => {
  if (!isSupabaseConfigured()) {
    throw Object.assign(new Error("Supabase storage is not configured."), {
      statusCode: 503,
    });
  }
};

// ─── Core storage functions ───────────────────────────────────────────────────────

/**
 * Upload a Buffer to a Supabase Storage bucket.
 * Returns { path, publicUrl }.
 */
export const uploadBufferToSupabase = async ({
  bucket,
  path: filePath,
  buffer,
  contentType,
}) => {
  requireSupabase();
  validateFile(buffer, contentType, bucket);

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw Object.assign(
      new Error(`Supabase upload failed: ${error.message}`),
      { statusCode: 502, cause: error }
    );
  }

  const publicUrl = getPublicUrl({ bucket, path: data.path });
  return { path: data.path, publicUrl };
};

/**
 * Delete a file from Supabase Storage.
 */
export const deleteSupabaseFile = async ({ bucket, path: filePath }) => {
  requireSupabase();
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([filePath]);
  if (error) {
    console.warn(`Supabase delete warning [${bucket}/${filePath}]: ${error.message}`);
  }
};

/**
 * Return the public URL for a stored file (bucket must be set to public).
 */
export const getPublicUrl = ({ bucket, path: filePath }) => {
  if (!isSupabaseConfigured()) return null;
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || null;
};

/**
 * Create a signed URL (for private buckets).
 */
export const createSignedUrl = async ({ bucket, path: filePath, expiresIn = 3600 }) => {
  requireSupabase();
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);
  if (error) {
    throw Object.assign(
      new Error(`Signed URL creation failed: ${error.message}`),
      { statusCode: 502 }
    );
  }
  return data.signedUrl;
};

// ─── Image asset metadata ─────────────────────────────────────────────────────────

/**
 * Insert a row into the Supabase image_assets table.
 * Returns the inserted row.
 */
export const saveImageAssetMetadata = async ({
  mongoOwnerId,
  relatedEntityType,
  relatedEntityId,
  bucket,
  filePath,
  publicUrl,
  fileName,
  mimeType,
  sizeBytes,
  altText,
}) => {
  requireSupabase();

  const { data, error } = await supabaseAdmin
    .from("image_assets")
    .insert({
      mongo_owner_id: mongoOwnerId || null,
      related_entity_type: relatedEntityType || null,
      related_entity_id: relatedEntityId || null,
      bucket,
      path: filePath,
      public_url: publicUrl || null,
      file_name: fileName || null,
      mime_type: mimeType || null,
      size_bytes: sizeBytes || null,
      alt_text: altText || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    // image_assets table likely not created yet.
    // Run the schema.sql in Supabase Dashboard → SQL Editor to fix this.
    // The upload itself succeeded — imageUrl is valid. imageAssetId will use the storage path fallback.
    if (process.env.NODE_ENV === "production") {
      console.error(`[image_assets] Insert failed in production — run schema.sql in Supabase: ${error.message}`);
    } else {
      console.warn(`[image_assets] Insert failed (table may not exist — run schema.sql): ${error.message}`);
    }
    return null;
  }

  return data;
};

export const markImageAssetOrphaned = async ({ assetId, reason }) => {
  requireSupabase();
  if (!assetId) return null;

  const { data, error } = await supabaseAdmin
    .from("image_assets")
    .update({
      status: "orphaned",
      metadata: reason ? { orphanedReason: reason } : undefined,
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) {
    console.warn(`Could not mark image asset orphaned: ${error.message}`);
    return null;
  }
  return data;
};

// ─── High-level upload helpers ────────────────────────────────────────────────────

/**
 * Build a safe, timestamped storage path:
 *   products/{productId}/{ts}-{safeFileName}
 *   users/{userId}/profile/{ts}-{safeFileName}
 *   employees/{employeeId}/profile/{ts}-{safeFileName}
 */
export const buildStoragePath = (...args) => {
  const [first, second, third] = args;
  const entityType = typeof first === "object" ? first.type : first;
  const entityId = typeof first === "object" ? first.entityId : second;
  const originalName = typeof first === "object" ? first.fileName : third;
  const ts = Date.now();
  const safe = sanitizeFileName(originalName);
  switch (entityType) {
    case "product":
      return `products/${entityId}/${ts}-${safe}`;
    case "user":
      return `users/${entityId}/profile/${ts}-${safe}`;
    case "employee":
      return `employees/${entityId}/profile/${ts}-${safe}`;
    default:
      return `misc/${entityType}/${entityId}/${ts}-${safe}`;
  }
};
