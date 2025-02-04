import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../Styles/Products.css";
import axios from "axios";

// Dropdown Component
const ProductsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dropdown">
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
        Products
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {[
            "news2024",
            "kitchen",
            "systems",
            "sofas",
            "day-complements",
            "night-complements",
            "outdoor",
          ].map((category) => (
            <Link key={category} to={`/${category}`} className="dropdown-item">
              {category.toUpperCase().replace("-", " ")}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Show Products Component
const ShowProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/Products")
      .then(({ data }) => setProducts(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div className="products-container">
      {products.map(({ id, name }) => (
        <div key={id}>{name}</div>
      ))}
    </div>
  );
};

// Product Form Component
const ProductForm = ({ handleSubmit, product }) => (
  <form onSubmit={handleSubmit}>
    {["name", "description", "category", "price", "images"].map((field) => (
      <div key={field} className="form-group">
        <label htmlFor={field}>
          {field.charAt(0).toUpperCase() + field.slice(1)}:
        </label>
        <input
          type="text"
          id={field}
          name={field}
          value={product[field] || ""}
          onChange={(e) =>
            product.setProduct((prev) => ({ ...prev, [field]: e.target.value }))
          }
        />
      </div>
    ))}
    <button type="submit" disabled={product.loading}>
      {product.loading ? "Processing..." : "Save Product"}
    </button>
  </form>
);

// Create Product Component
const CreateProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    images: "",
    loading: false,
  });
  const navigate = useNavigate();

  const handleSaveProduct = (e) => {
    e.preventDefault();
    setProduct((prev) => ({ ...prev, loading: true }));

    axios
      .post("http://localhost:3000/Products", product)
      .then(() => navigate("/"))
      .catch(console.error)
      .finally(() => setProduct((prev) => ({ ...prev, loading: false })));
  };

  return (
    <ProductForm
      handleSubmit={handleSaveProduct}
      product={{ ...product, setProduct }}
    />
  );
};

// Edit Product Component
const EditProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    images: "",
    loading: false,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:3000/Products/${id}`)
      .then(({ data }) => setProduct({ ...data, loading: false }))
      .catch(console.error);
  }, [id]);

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    setProduct((prev) => ({ ...prev, loading: true }));

    axios
      .put(`http://localhost:3000/Products/${id}`, product)
      .then(() => navigate("/"))
      .catch(console.error)
      .finally(() => setProduct((prev) => ({ ...prev, loading: false })));
  };

  return (
    <ProductForm
      handleSubmit={handleUpdateProduct}
      product={{ ...product, setProduct }}
    />
  );
};

// Delete Product Component
const DeleteProduct = () => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDeleteProduct = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:3000/Products/${id}`)
      .then(() => navigate("/"))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <button onClick={handleDeleteProduct} disabled={loading}>
      {loading ? "Deleting..." : "Delete Product"}
    </button>
  );
};

export {
  ProductsDropdown,
  ShowProducts,
  CreateProduct,
  EditProduct,
  DeleteProduct,
};
