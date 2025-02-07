import React, { useState, useEffect, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import { Link } from "react-router-dom";
import {
  FaCouch,
  FaChartLine,
  FaShoppingCart,
  FaBoxes,
  FaTools,
  FaTrash,
  FaEye,
  FaEdit,
} from "react-icons/fa";
import { Modal } from "react-bootstrap";
import "../../Styles/dashboard.css";
import { useAuthContext } from "../../context/AuthContext";
import axios from "axios";

const Sidebar = () => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const savedProfilePhoto = localStorage.getItem("profilePhoto");
    if (savedProfilePhoto) {
      setProfilePhoto(savedProfilePhoto);
    } else if (user && user.profilePhoto) {
      setProfilePhoto(user.profilePhoto);
    }
  }, [user]);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setImage(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      localStorage.removeItem("profilePhoto");
    }
  };

  const handleSave = async () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const dataUrl = canvas.toDataURL();
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const formData = new FormData();
      formData.append("photoFile", blob, "profile-photo.png");

      try {
        const response = await axios.put(
          `http://localhost:4000/api/users/update/${user._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const newProfilePhoto = response.data.user.profilePhoto;
        setProfilePhoto(newProfilePhoto);
        localStorage.setItem("profilePhoto", newProfilePhoto);
        setImage(null);
        setIsEditing(false);
      } catch (error) {
        console.error("Error uploading profile photo:", error);
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          {isAuthenticated && user ? `Welcome, ${user.username}` : "Guest"}
        </h2>
        {isAuthenticated && (
          <div className="profile-photo-section">
            {profilePhoto ? (
              <>
                <img
                  src={`http://localhost:4000${profilePhoto}`}
                  alt="Profile"
                  className="profile-photo"
                />
                <div className="icon-buttons">
                  <button onClick={toggleEdit}>
                    <FaEdit />
                  </button>
                  <button onClick={() => setShowPreview(true)}>
                    <FaEye />
                  </button>
                </div>
              </>
            ) : (
              <p>No Profile Photo</p>
            )}
            {isEditing && (
              <>
                <input type="file" onChange={handleImageChange} />
                {image && (
                  <div className="avatar-editor">
                    <AvatarEditor
                      ref={editorRef}
                      image={image}
                      width={150}
                      height={150}
                      border={30}
                      borderRadius={100}
                      color={[255, 255, 255, 0.6]}
                      scale={scale}
                      rotate={rotate}
                    />
                    <div className="controls">
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                      />
                      <button onClick={() => setRotate((prev) => prev + 90)}>
                        Rotate
                      </button>
                      <button onClick={handleSave}>Save Profile Photo</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={`http://localhost:4000${profilePhoto}`}
            alt="Profile Preview"
            className="img-fluid"
          />
        </Modal.Body>
      </Modal>

      <ul className="sidebar-menu">
        <li>
          <Link to="/products">
            <FaCouch /> Products
          </Link>
        </li>
        <li>
          <Link to="/orders">
            <FaShoppingCart /> Orders
          </Link>
        </li>
        <li>
          <Link to="/inventory">
            <FaBoxes /> Inventory
          </Link>
        </li>
        <li>
          <Link to="/analytics">
            <FaChartLine /> Analytics
          </Link>
        </li>
        <li>
          <Link to="/settings">
            <FaTools /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default React.memo(Sidebar);
