import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../Styles/Products.css";
import axios from "axios";
import { AiOutlineEdit } from "react-icons/ai";

// Dropdown Component
const ProductsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        Products
      </button>
      <div className={`dropdown-menu ${isOpen ? "show" : ""}`}>
        <Link to="/news2024" className="dropdown-item">
          NEWS 2024
        </Link>
        <Link to="/kitchen" className="dropdown-item">
          KITCHEN
        </Link>
        <Link to="/systems" className="dropdown-item">
          SYSTEMS
        </Link>
        <Link to="/sofas" className="dropdown-item">
          SOFAS
        </Link>
        <Link to="/day-complements" className="dropdown-item">
          DAY COMPLEMENTS
        </Link>
        <Link to="/night-complements" className="dropdown-item">
          NIGHT COMPLEMENTS
        </Link>
        <Link to="/outdoor" className="dropdown-item">
          OUTDOOR
        </Link>
      </div>
    </div>
  );
};

// Show Products Component
const ShowProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:3000/Products")
      .then((response) => {
        setProducts(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="products-container">
      {/* Map through the products and display them */}
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};

// Create Product Component
const CreateProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSaveProduct = () => {
    const data = { name, description, category, price, images };
    setLoading(true);

    axios
      .post("http://localhost:3000/Products", data)
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        alert("An error occurred. Please check the console.");
        console.error(error);
      });
  };

  return (
    <div>
      {/* Form for creating a product */}
      <button onClick={handleSaveProduct} disabled={loading}>
        Save Product
      </button>
    </div>
  );
};

// Edit Product Component
const EditProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3000/Products/${id}`)
      .then((response) => {
        const product = response.data;
        setName(product.name);
        setDescription(product.description);
        setCategory(product.category);
        setPrice(product.price);
        setImages(product.images);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        alert("An error occurred. Please check the console.");
        console.error(error);
      });
  }, [id]);

  const handleUpdateProduct = () => {
    const data = { name, description, category, price, images };
    setLoading(true);

    axios
      .put(`http://localhost:3000/Products/${id}`, data)
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        alert("An error occurred. Please check the console.");
        console.error(error);
      });
  };

  return (
    <div>
      {/* Form for editing a product */}
      <button onClick={handleUpdateProduct} disabled={loading}>
        Update Product
      </button>
    </div>
  );
};

// Delete Product Component
const DeleteProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleDeleteProduct = () => {
    setLoading(true);

    axios
      .delete(`http://localhost:3000/Products/${id}`)
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        alert("An error occurred. Please check the console.");
        console.error(error);
      });
  };

  return (
    <div>
      {/* Button to delete a product */}
      <button onClick={handleDeleteProduct} disabled={loading}>
        Delete Product
      </button>
    </div>
  );
};

export {
  ProductsDropdown,
  ShowProducts,
  CreateProduct,
  EditProduct,
  DeleteProduct,
};
