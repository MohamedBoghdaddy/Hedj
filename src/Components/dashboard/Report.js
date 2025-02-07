import { useEffect, useState } from "react";
import axios from "axios";
import { BsFileEarmarkText, BsDownload } from "react-icons/bs";
import "../../Styles/dashboard.css";

const Report = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get("/api/reports");
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = (reportId) => {
    window.open(`/api/reports/download/${reportId}`, "_blank");
  };

  return (
    <div className="report-container">
      <h2>Reports</h2>
      <div className="report-list">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="report-card">
              <BsFileEarmarkText className="report-icon" />
              <div className="report-info">
                <h4>{report.title}</h4>
                <p>{new Date(report.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDownload(report.id)}
                className="download-btn"
              >
                <BsDownload /> Download
              </button>
            </div>
          ))
        ) : (
          <p>No reports available.</p>
        )}
      </div>
    </div>
  );
};

export default Report;
