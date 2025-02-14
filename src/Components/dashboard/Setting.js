import { useState, useEffect } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useDashboard from "../../hooks/useDashboard";
import { useAuthContext } from "../../context/AuthContext";
import "../../Styles/Settings.css";
const Setting = () => {
  const { user, updateUser } = useAuthContext();
  const { state, fetchProfile, handleUpdateProfile, fetchDashboardData } =
    useDashboard();

  // Local state for profile updates
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // Fetch Profile Data on Mount
  useEffect(() => {
    fetchDashboardData(); // Load all dashboard data
    if (user?._id) {
      fetchProfile(); // Fetch user profile
    }
  }, [fetchDashboardData, user]);

  // Sync Profile State with Context
  useEffect(() => {
    if (state.profile) {
      setProfile({
        name: state.profile.name || "",
        email: state.profile.email || "",
        password: "", // Password remains empty for security reasons
        role: state.profile.role || "",
      });
    }
  }, [state.profile]);

  // Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle profile update
  const handleSubmitProfileUpdate = async () => {
    try {
      await handleUpdateProfile(profile);
      updateUser(profile); // Update global user state
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Error updating profile.");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      {/* Profile Update Section */}
      <h3>Profile Information</h3>
      <Form>
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={profile.password}
            onChange={handleChange}
            placeholder="Enter new password (optional)"
          />
        </Form.Group>

        <Form.Group controlId="role">
          <Form.Label>Role</Form.Label>
          <Form.Control
            as="select"
            name="role"
            value={profile.role}
            onChange={handleChange}
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </Form.Control>
        </Form.Group>

        <Button
          variant="primary"
          onClick={handleSubmitProfileUpdate}
          className="mt-3"
        >
          Update Profile
        </Button>
      </Form>

      {/* Settings Section */}
      {state.settings ? (
        <>
          <h3>General Settings</h3>
          <Table striped bordered hover>
            <tbody>
              <tr>
                <td>Mode</td>
                <td>{state.settings.mode}</td>
              </tr>
              <tr>
                <td>Notifications</td>
                <td>{state.settings.notifications ? "Enabled" : "Disabled"}</td>
              </tr>
            </tbody>
          </Table>
        </>
      ) : (
        <p>No settings available.</p>
      )}

      {/* Analytics Section */}
      <h3>Business Analytics</h3>
      <Table striped bordered hover>
        <tbody>
          <tr>
            <td>Products</td>
            <td>{state.products?.length || 0}</td>
          </tr>
          <tr>
            <td>Customers</td>
            <td>{state.customers?.length || 0}</td>
          </tr>
          <tr>
            <td>Employees</td>
            <td>{state.employees?.length || 0}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default Setting;
