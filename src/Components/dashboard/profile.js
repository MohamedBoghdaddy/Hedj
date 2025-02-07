import { useState, useEffect } from "react";
import axios from "axios";
import { BsPersonCircle, BsPencilSquare } from "react-icons/bs";
import "../../Styles/dashboard.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/api/users/profile");
        setUser(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUser();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put("/api/users/profile", formData);
      setUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {user ? (
        <div className="profile-card">
          <BsPersonCircle className="profile-icon" />
          {isEditing ? (
            <div className="profile-edit">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <button onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="profile-info">
              <h3>{user.name}</h3>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone || "N/A"}</p>
              <button onClick={handleEditToggle} className="edit-button">
                <BsPencilSquare /> Edit
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
