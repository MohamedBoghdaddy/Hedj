import { useState, useEffect } from "react";
import { BsPersonCircle, BsPencilSquare } from "react-icons/bs";
import useDashboard from "../../hooks/useDashboard";
import { toast } from "react-toastify";
import "../../Styles/Profile.css";

const Profile = () => {
  const { state, fetchProfile, updateProfile } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Load profile data when the component mounts
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Set form data when profile is available
  useEffect(() => {
    if (state.profile) {
      setFormData({
        name: state.profile.name || "",
        email: state.profile.email || "",
        phone: state.profile.phone || "",
      });
    }
  }, [state.profile]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData); // Use updateProfile from DashboardContext
      toast.success("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error updating profile.");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {state.profile ? (
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
              <h3>{state.profile.name}</h3>
              <p>Email: {state.profile.email}</p>
              <p>Phone: {state.profile.phone || "N/A"}</p>
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
