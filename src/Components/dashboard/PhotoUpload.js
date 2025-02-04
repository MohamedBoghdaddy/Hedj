import  { useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";

const PhotoUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadStatus("File uploaded successfully");
      setErrorMessage(""); // Clear any previous error messages
      onUpload(response.data.file.filename); // Pass the uploaded file path to the parent
    } catch (error) {
      setUploadStatus("File upload failed");
      setErrorMessage(
        error.response?.data?.error ||
          "An unexpected error occurred during file upload"
      );
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
