import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import useDashboard from "../../hooks/useDashboard";
import "../../Styles/Profile.css"
const PhotoUpload = ({ onUpload }) => {
  const { uploadPhoto } = useDashboard(); // Use DashboardContext function
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    try {
      const uploadedFilePath = await uploadPhoto(file); // Use uploadPhoto from context
      setUploadStatus("File uploaded successfully!");
      setErrorMessage(""); // Clear previous errors
      if (onUpload) onUpload(uploadedFilePath); // Pass uploaded photo path
    } catch (error) {
      setUploadStatus("File upload failed");
      setErrorMessage("An error occurred during file upload.");
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <Form onSubmit={handleUpload} id="photo">
        <Form.Group controlId="formFile">
          <Form.Label>Upload Photo</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Upload
        </Button>
      </Form>
      {uploadStatus && <p>{uploadStatus}</p>}
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
    </div>
  );
};

export default PhotoUpload;
