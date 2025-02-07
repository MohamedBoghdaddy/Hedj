import { BsPersonCircle } from "react-icons/bs";
import "../../Styles/dashboard.css";

const ProfileHeader = ({ user }) => {
  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt="Profile"
            className="profile-photo"
          />
        ) : (
          <BsPersonCircle className="default-avatar" />
        )}
      </div>
      <div className="profile-info">
        <h2>{user?.name || "Guest"}</h2>
        <p>{user?.email || "No email available"}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
