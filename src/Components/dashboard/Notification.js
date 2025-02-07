import "../../Styles/Notifications.css"; 

const Notification = ({ type, message }) => {
  return <div className={`notification ${type}`}>{message}</div>;

};

export default Notification;
