import React from "react";
import Sidebar from "./sidebar";
import Contents from "./contents";
import Profile from "./profile";
import "../src/App.css";

const App = ()=>{
    return <div className="dashboard">
      <Sidebar />
      <div className="dashboardcontents">
      <Contents />
      <Profile />
    </div>
    </div>;
  };
  export default App;