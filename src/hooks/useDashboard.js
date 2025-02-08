import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";

const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within an DashboardPrpvider");
  }

  return context;
};

export default useDashboard;
