import PropTypes from "prop-types";

const ProfileHeader = ({ isCollapsed }) => {
  return (
    <div className={`profile-header ${isCollapsed ? "collapsed" : ""}`}>
      <h2 className="profile-title">{!isCollapsed && "Profile"}</h2>
    </div>
  );
};

ProfileHeader.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
};

export default ProfileHeader;
