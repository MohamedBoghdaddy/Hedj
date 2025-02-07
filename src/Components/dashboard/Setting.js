import  { useState, useEffect, useContext } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../dashboard/Notification";
import { DashboardContext } from "../../context/DashboardContext";
import { useAuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useParams } from "react-router-dom";

const Setting = () => {
  const { user } = useAuthContext();
  const {
    fetchWorkspacesByUserId,
    fetchDocuments,
    addCollaboratorToWorkspace,
    documents,
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    fetchCollaborators,
  } = useContext(DashboardContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorSearch, setCollaboratorSearch] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [notification] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Viewer");
  const { workspaceId } = useParams();

  
  // Fetch workspaces and collaborators on component mount
  useEffect(() => {
    if (user?.id) {
      fetchWorkspacesByUserId(user._id);
    }
    if (workspaceId && fetchCollaborators) {
      fetchCollaborators(workspaceId)
        .then((collaborators) => {
          if (collaborators.length === 0) {
            toast.info("No collaborators found for this workspace.");
          } else {
            setCollaborators(collaborators);
          }
        })
        .catch((error) => {
          toast.error("Error fetching collaborators.");
          console.error("Error fetching collaborators:", error);
        });
    }
  }, [user, workspaceId, fetchWorkspacesByUserId, fetchCollaborators]);

  // Filter documents based on search term
  useEffect(() => {
    if (searchTerm.length >= 3) {
      const filtered = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchTerm, documents]);

  // Handle workspace selection
  const handleWorkspaceSelection = (workspace) => {
    setSelectedWorkspace(workspace);
    fetchDocuments(workspace._id);
    handleFetchCollaborators(workspace._id);
  };

  // Search collaborators based on username
  const handleCollaboratorSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/users/search?username=${collaboratorSearch}`
      );
      setCollaborators(response.data || []);
    } catch (error) {
      toast.error("Error fetching collaborators.");
    }
  };

  // Fetch collaborators for a workspace
  const handleFetchCollaborators = async (workspaceId) => {
    try {
      // Ensure workspaceId is valid
      if (!workspaceId || !workspaceId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid workspace ID");
      }

      const response = await axios.get(
        `http://localhost:4000/api/workspaces/${workspaceId}/collaborators`,
        { withCredentials: true }
      );
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          toast.info("No collaborators found for this workspace.");
          setCollaborators([]); // Reset or handle as per requirement
        } else {
          setCollaborators(response.data);
        }
      } else {
        console.error("No valid data received for collaborators");
        setCollaborators([]); // Reset or handle as per requirement
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast.error("Failed to fetch collaborators.");
      setCollaborators([]); // Reset or handle as per requirement
    }
  };

  // Add collaborator to workspace
  const handleAddCollaborator = async (collaborator) => {
    if (!collaborator || !collaborator._id) {
      toast.error("Collaborator ID is missing.");
      return;
    }

    try {
      await addCollaboratorToWorkspace(collaborator);
      toast.success(`${collaborator.username} added as ${selectedRole}.`);
      handleFetchCollaborators(selectedWorkspace._id);
    } catch (error) {
      toast.error(error.message || "Error adding collaborator.");
      console.error("Error adding collaborator:", error);
    }
  };

  return (
    <div className="workspace-container">
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      {/* Workspace selection */}
      <h3>Select a Workspace</h3>
      {Array.isArray(workspaces) && workspaces.length > 0 ? (
        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <button
              key={workspace._id}
              onClick={() => handleWorkspaceSelection(workspace)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleWorkspaceSelection(workspace);
                }
              }}
              className={`workspace-item ${
                selectedWorkspace?._id === workspace._id ? "selected" : ""
              }`}
            >
              {workspace.name}
            </button>
          ))}
        </div>
      ) : (
        <p>No workspaces available.</p>
      )}

      {/* Documents list */}
      {selectedWorkspace && (
        <>
          <h4>Documents in Workspace: {selectedWorkspace.name}</h4>

          <Form className="mb-3">
            <Form.Group controlId="search" className="mb-3">
              <Form.Label>Search Documents</Form.Label>
              <div className="search-bar">
                <Form.Control
                  type="text"
                  placeholder="Search by document name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
              </div>
            </Form.Group>
          </Form>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <tr key={document._id}>
                    <td>{document.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>No documents found</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Collaborator search and add */}
          <Form className="mt-3">
            <Form.Group controlId="collaboratorSearch">
              <Form.Label>Search for Collaborators</Form.Label>
              <div className="search-bar">
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={collaboratorSearch}
                  onChange={(e) => setCollaboratorSearch(e.target.value)}
                />
                <Button onClick={handleCollaboratorSearch} className="ms-2">
                  <FontAwesomeIcon icon={faSearch} /> Search
                </Button>
              </div>
            </Form.Group>
          </Form>

          {/* Collaborator Role Selection */}
          <Form.Group controlId="collaboratorRoleSelect" className="mb-3">
            <Form.Label>Select Role</Form.Label>
            <Form.Control
              as="select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </Form.Control>
          </Form.Group>

          <h5>Collaborators</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collaborators.length > 0 ? (
                collaborators.map((collaborator, index) => (
                  <tr key={collaborator._id || `collaborator-${index}`}>
                    <td>{collaborator.username}</td>
                    <td>{collaborator.email}</td>
                    <td>
                      <Button
                        variant="success"
                        onClick={() => handleAddCollaborator(collaborator)}
                      >
                        Add as {selectedRole}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No collaborators found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default Setting;
