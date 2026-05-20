import { useCallback, useEffect, useRef, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import { commerceApi, storageApi } from "../services/api";
import "../Styles/admin-premium.css";

// ─── helpers ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  collection: "",
  sku: "",
  material: "",
  color: "",
  room: "",
  dimensions: "",
  tags: "",
  price: "",
  discountPrice: "",
  stock: "",
  status: "active",
  featured: false,
  images: [],
};

const NUMERIC_FORM_FIELDS = new Set(["price", "discountPrice", "stock"]);

const cleanNumericInput = (value) => String(value ?? "").replace(/,/g, "");

const formNumberValue = (value) => {
  if (value === null || value === undefined) return "";
  return cleanNumericInput(value);
};

const parseFormNumber = (value) => Number(cleanNumericInput(value));

const statusBadge = (stock) => {
  if (Number(stock) === 0) return { label: "Out of Stock", cls: "badge-danger" };
  if (Number(stock) <= 5) return { label: "Low Stock", cls: "badge-warn" };
  return { label: "In Stock", cls: "badge-ok" };
};

const productKey = (product) => product?._id || product?.id;

const adminProductErrorMessage = (error, fallback = "Product request failed.") => {
  if (error?.status === 401) return "Admin login required.";
  if (error?.status === 403) return "Admin permission required.";
  if (error?.status === 404) {
    return "Admin products route not found. Restart or redeploy the backend.";
  }
  if (error?.status === 503) return "Storage or database is not configured or unavailable.";

  const message = error?.message || "";
  if (/access denied|unauthorized|forbidden|admins only/i.test(message)) {
    return "Admin login or permission required.";
  }
  if (/api route not found|not found:.*api\/admin\/products/i.test(message)) {
    return "Admin products API route is unavailable. Check backend route mounting.";
  }
  return message || fallback;
};

// ─── component ───────────────────────────────────────────────────────────────────

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const [modal, setModal] = useState(null); // null | "add" | "edit" | "view"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const galleryRef = useRef();

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "info" }), 3000);
  }, []);

  // ── load products ──────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await commerceApi.getAdminProducts();
      setProducts(Array.isArray(data) ? data : data?.products || []);
    } catch (err) {
      showToast(adminProductErrorMessage(err, "Could not load products from server."), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── form helpers ───────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSelected(null);
    setImageFile(null);
    setImagePreview(null);
    setModal("add");
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      collection: product.collection || "",
      sku: product.sku || "",
      material: product.material || "",
      color: product.color || "",
      room: product.room || product.useCase || "",
      dimensions: product.dimensions || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "",
      price: formNumberValue(product.price),
      discountPrice: formNumberValue(product.discountPrice),
      stock: formNumberValue(product.stock),
      status: product.status || "active",
      featured: Boolean(product.featured || product.isFeatured),
      images: product.images || [],
    });
    setSelected(product);
    setImageFile(null);
    setImagePreview(product.imageUrl || product.images?.[0] || null);
    setModal("edit");
  };

  const openView = (product) => { setSelected(product); setModal("view"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      e.target.type === "checkbox"
        ? e.target.checked
        : NUMERIC_FORM_FIELDS.has(name)
          ? cleanNumericInput(value)
          : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── save (create / update) ─────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const price = parseFormNumber(form.price);
      const stock = parseFormNumber(form.stock);
      const discountPrice =
        form.discountPrice === "" ? null : parseFormNumber(form.discountPrice);
      const name = form.name.trim();
      const description = form.description.trim();
      const category = form.category.trim();

      if (!name || !description || !category) {
        showToast("Name, description, and category are required.", "error");
        return;
      }
      if (form.price === "" || form.stock === "") {
        showToast("Price and stock are required.", "error");
        return;
      }
      if (!Number.isFinite(price) || price < 0) {
        showToast("Price must be a non-negative number.", "error");
        return;
      }
      if (!Number.isFinite(stock) || stock < 0) {
        showToast("Stock must be a non-negative number.", "error");
        return;
      }
      if (
        discountPrice !== null &&
        (!Number.isFinite(discountPrice) || discountPrice < 0)
      ) {
        showToast("Discount price must be a non-negative number.", "error");
        return;
      }

      const payload = {
        name,
        description,
        category,
        collection: form.collection.trim() || category,
        sku: form.sku.trim(),
        material: form.material.trim(),
        color: form.color.trim(),
        room: form.room.trim(),
        useCase: form.room.trim(),
        dimensions: form.dimensions.trim(),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        price,
        discountPrice,
        stock,
        status: form.status || "active",
        featured: Boolean(form.featured),
      };

      let savedProduct;
      if (modal === "add") {
        const result = await commerceApi.createProduct?.(payload);
        savedProduct = result?.product || result;
        showToast("Product created.", "ok");
      } else {
        const result = await commerceApi.updateProduct?.(productKey(selected), payload);
        savedProduct = result?.product || result;
        showToast("Product updated.", "ok");
      }

      // Upload image if a new file was chosen
      if (imageFile && productKey(savedProduct)) {
        setUploading(true);
        try {
          const up = await storageApi.uploadProductImage(productKey(savedProduct), imageFile);
          savedProduct = up.product || savedProduct;
          showToast("Image uploaded to Supabase.", "ok");
        } catch (err) {
          showToast(`Product saved but image upload failed: ${err.message}`, "warn");
        } finally {
          setUploading(false);
        }
      }

      await loadProducts();
      closeModal();
    } catch (err) {
      showToast(adminProductErrorMessage(err, "Save failed."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ── upload image for existing product ──────────────────────────────────────────
  const handleImageUpload = async (product) => {
    if (!imageFile) return showToast("Select a file first.", "warn");
    setUploading(true);
    try {
      const up = await storageApi.uploadProductImage(productKey(product), imageFile);
      showToast("Image uploaded.", "ok");
      setImagePreview(up.imageUrl);
      await loadProducts();
    } catch (err) {
      showToast(`Upload failed: ${err.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (product, files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      await storageApi.uploadProductGallery(productKey(product), selectedFiles);
      showToast("Gallery images uploaded.", "ok");
      await loadProducts();
    } catch (err) {
      showToast(`Gallery upload failed: ${err.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────────
  const handleDelete = async (product) => {
    if (!window.confirm(`Archive "${product.name}"? It will be hidden from public product pages.`)) return;
    try {
      await commerceApi.deleteProduct?.(productKey(product));
      showToast("Product archived.", "ok");
      await loadProducts();
    } catch (err) {
      showToast(adminProductErrorMessage(err, "Delete failed."), "error");
    }
  };

  // ── stats ──────────────────────────────────────────────────────────────────────
  const outOfStock = products.filter((p) => Number(p.stock) === 0).length;
  const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
  const archived = products.filter((p) => p.status === "archived").length;

  return (
    <AdminShell active="Products" title="Product Catalogue">
      {/* toast */}
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* stats row */}
      <section className="admin-stats-row">
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Low Stock" value={lowStock} warn />
        <StatCard label="Out of Stock" value={outOfStock} danger />
        <StatCard label="Archived" value={archived} />
      </section>

      {/* toolbar */}
      <div className="admin-toolbar">
        <h2 className="admin-section-title">All Products</h2>
        <button className="admin-premium-button primary" type="button" onClick={openAdd}>
          <span className="material-symbols-outlined">add</span>
          Add Product
        </button>
      </div>

      {/* table */}
      {loading ? (
        <p className="admin-loading">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="admin-empty">No products yet. Click "Add Product" to create one.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const badge = statusBadge(product.stock);
                const thumb = product.imageUrl || product.images?.[0];
                return (
                  <tr key={productKey(product)}>
                    <td>
                      {thumb ? (
                        <img className="admin-product-thumb" src={thumb} alt={product.name} />
                      ) : (
                        <span className="admin-product-thumb-placeholder material-symbols-outlined">
                          image
                        </span>
                      )}
                    </td>
                    <td className="admin-cell-name">{product.name}</td>
                    <td>{product.collection || product.category}</td>
                    <td>${Number(product.price || 0).toLocaleString()}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`admin-badge ${product.status === "archived" ? "badge-muted" : badge.cls}`}>
                        {product.status === "archived" ? "Archived" : badge.label}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => openView(product)}>View</button>
                        <button type="button" onClick={() => openEdit(product)}>Edit</button>
                        <button type="button" className="danger" onClick={() => handleDelete(product)}>Archive</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{modal === "add" ? "Add Product" : `Edit: ${selected?.name}`}</h2>
              <button type="button" className="admin-modal-close" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="admin-modal-form" onSubmit={handleSave}>
              {/* image upload */}
              <div className="admin-image-upload-area">
                {imagePreview ? (
                  <img className="admin-image-preview" src={imagePreview} alt="Preview" />
                ) : (
                  <div className="admin-image-placeholder">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    <p>No image selected</p>
                  </div>
                )}
                <div className="admin-image-upload-controls">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    ref={fileRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="admin-premium-button"
                    onClick={() => fileRef.current?.click()}
                  >
                    <span className="material-symbols-outlined">upload</span>
                    {imageFile ? "Change Image" : "Choose Image"}
                  </button>
                  {imageFile && (
                    <span className="admin-file-name">{imageFile.name}</span>
                  )}
                  {uploading && <span className="admin-uploading">Uploading...</span>}
                  {!imageFile && (
                    <p className="admin-upload-hint">
                      Image will be uploaded to Supabase Storage on save.
                    </p>
                  )}
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="prod-name">Name *</label>
                  <input id="prod-name" name="name" value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-category">Category *</label>
                  <input id="prod-category" name="category" value={form.category} onChange={handleFormChange} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-collection">Collection</label>
                  <input id="prod-collection" name="collection" value={form.collection} onChange={handleFormChange} />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-sku">SKU</label>
                  <input id="prod-sku" name="sku" value={form.sku} onChange={handleFormChange} />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-material">Material</label>
                  <input id="prod-material" name="material" value={form.material} onChange={handleFormChange} placeholder="Marble, walnut, linen" />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-color">Color</label>
                  <input id="prod-color" name="color" value={form.color} onChange={handleFormChange} placeholder="Black, oak, ivory" />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-room">Room / Use Case</label>
                  <input id="prod-room" name="room" value={form.room} onChange={handleFormChange} placeholder="Living room, dining, office" />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-dimensions">Dimensions</label>
                  <input id="prod-dimensions" name="dimensions" value={form.dimensions} onChange={handleFormChange} placeholder="220 x 80 x 74 cm" />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-price">Price ($) *</label>
                  <input id="prod-price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-discount">Discount Price ($)</label>
                  <input id="prod-discount" name="discountPrice" type="number" min="0" step="0.01" value={form.discountPrice} onChange={handleFormChange} />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-stock">Stock *</label>
                  <input id="prod-stock" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-status">Status</label>
                  <select id="prod-status" name="status" value={form.status} onChange={handleFormChange}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="prod-featured">Featured</label>
                  <label className="admin-checkbox-row" htmlFor="prod-featured">
                    <input
                      id="prod-featured"
                      name="featured"
                      type="checkbox"
                      checked={form.featured}
                      onChange={handleFormChange}
                    />
                    <span>Prioritize in customer listings</span>
                  </label>
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor="prod-desc">Description *</label>
                <textarea id="prod-desc" name="description" rows={4} value={form.description} onChange={handleFormChange} required />
              </div>

              <div className="admin-field">
                <label htmlFor="prod-tags">Tags</label>
                <input id="prod-tags" name="tags" value={form.tags} onChange={handleFormChange} placeholder="sofa, storage, sculptural" />
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-premium-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-premium-button primary" disabled={saving || uploading}>
                  {saving ? "Saving…" : modal === "add" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View drawer */}
      {modal === "view" && selected && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{selected.name}</h2>
              <button type="button" className="admin-modal-close" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="admin-view-body">
              {/* image + upload */}
              <div className="admin-image-upload-area">
                {imagePreview || selected.imageUrl || selected.images?.[0] ? (
                  <img
                    className="admin-image-preview"
                    src={imagePreview || selected.imageUrl || selected.images?.[0]}
                    alt={selected.name}
                  />
                ) : (
                  <div className="admin-image-placeholder">
                    <span className="material-symbols-outlined">image</span>
                    <p>No image</p>
                  </div>
                )}
                <div className="admin-image-upload-controls">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    ref={fileRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="admin-premium-button"
                    onClick={() => fileRef.current?.click()}
                  >
                    <span className="material-symbols-outlined">upload</span>
                    {imageFile ? "Change Image" : "Upload New Image"}
                  </button>
                  {imageFile && (
                    <button
                      type="button"
                      className="admin-premium-button primary"
                      onClick={() => handleImageUpload(selected)}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Save to Supabase"}
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    ref={galleryRef}
                    style={{ display: "none" }}
                    onChange={(event) => handleGalleryUpload(selected, event.target.files)}
                  />
                  <button
                    type="button"
                    className="admin-premium-button"
                    onClick={() => galleryRef.current?.click()}
                    disabled={uploading}
                  >
                    <span className="material-symbols-outlined">collections</span>
                    Add Gallery
                  </button>
                </div>
              </div>

              <dl className="admin-detail-list">
                <dt>Category</dt><dd>{selected.category}</dd>
                <dt>Collection</dt><dd>{selected.collection || "Not set"}</dd>
                <dt>SKU</dt><dd>{selected.sku || "Not set"}</dd>
                <dt>Status</dt><dd>{selected.status || "active"}</dd>
                <dt>Price</dt><dd>${Number(selected.price || 0).toLocaleString()}</dd>
                {selected.discountPrice && <><dt>Discount Price</dt><dd>${Number(selected.discountPrice).toLocaleString()}</dd></>}
                <dt>Stock</dt><dd>{selected.stock}</dd>
                <dt>Description</dt><dd>{selected.description}</dd>
                {selected.imageAssetId && <><dt>Supabase Asset ID</dt><dd className="admin-mono">{selected.imageAssetId}</dd></>}
              </dl>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-premium-button" onClick={() => { closeModal(); openEdit(selected); }}>Edit</button>
              <button type="button" className="admin-premium-button danger" onClick={() => { closeModal(); handleDelete(selected); }}>Archive</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

const StatCard = ({ label, value, warn, danger }) => (
  <div className={`admin-stat-card${warn ? " warn" : danger ? " danger" : ""}`}>
    <p>{label}</p>
    <strong>{value}</strong>
  </div>
);
