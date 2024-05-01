import React from "react";
import Contents from "./contents";
import Profile from "./profile";
import "../dashboard/App.css";
import Sidebar from "./sidebar";


const App = ()=>{
    return <div className="dashboard">
      <Sidebar />
      <div className="dashboardcontents">
      <Profile />
      <Contents />
     
    </div>
    </div>;
  };
  export default App;