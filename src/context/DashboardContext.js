import  {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

export const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;

  // State variables
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Viewer");
  const handleError = (error, defaultMessage) => {
    console.error(error);
    toast.error(defaultMessage || "Something went wrong.");
  };

  const createWorkspace = useCallback(async (workspaceData) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/workspaces/createWorkspace",
        workspaceData,
        { withCredentials: true }
      );

      setWorkspaces((prevWorkspaces) => {
        // Ensure prevWorkspaces is always an array
        const workspacesArray = Array.isArray(prevWorkspaces)
          ? prevWorkspaces
          : [];
        return [...workspacesArray, response.data];
      });

      toast.success("Workspace created successfully.");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace.");
    }
  }, []);

  const fetchWorkspacesByUser = useCallback(async () => {
    if (!isAuthenticated || !user) {
      toast.error("You need to log in to fetch workspaces.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:4000/api/workspaces/${user._id}`,
        {
          withCredentials: true,
        }
      );
      setWorkspaces(response.data || []);
    } catch (error) {
      handleError(error, "Failed to fetch workspaces.");
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const deleteWorkspace = useCallback(
    async (workspaceId) => {
      try {
        await axios.delete(
          `http://localhost:4000/api/workspaces/deleteWorkspace/${workspaceId}`,
          {
            withCredentials: true,
          }
        );
        setWorkspaces(
          workspaces.filter((workspace) => workspace._id !== workspaceId)
        );
        toast.success("Workspace deleted successfully.");
      } catch (error) {
        console.error("Error deleting workspace:", error);
        toast.error("Failed to delete workspace.");
      }
    },
    [workspaces]
  );

  const fetchDocuments = useCallback(
    async (workspaceId, onlyDeleted = false) => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/documents/${workspaceId}/documents`,
          { withCredentials: true }
        );
        const allDocuments = response.data || [];

        // Filter the documents based on the deleted status
        const filtered = onlyDeleted
          ? allDocuments.filter((doc) => doc.deleted)
          : allDocuments.filter((doc) => !doc.deleted);

        setDocuments(filtered);
        setRecycleBin(allDocuments.filter((doc) => doc.deleted));
      } catch (error) {
        handleError(error, "Failed to fetch documents.");
      }
    },
    []
  );

  const uploadDocument = useCallback(async (workspaceId, documentData) => {
    try {
      console.log("Uploading document:", documentData.file);
      console.log("For workspace ID:", workspaceId);

      const formData = new FormData();
      formData.append("document", documentData.file); // Ensure `documentData.file` is a valid file object
      formData.append("workspaceId", workspaceId); // Ensure workspaceId is not empty or undefined

      const response = await axios.post(
        "http://localhost:4000/api/documents/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setDocuments((prev) => [...prev, response.data.document]);
      toast.success("Document uploaded successfully.");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload document."
      );
    }
  }, []);

  const deleteDocument = useCallback(async (documentId) => {
    try {
      if (!documentId) {
        throw new Error("Invalid document ID.");
      }
      const response = await axios.put(
        `http://localhost:4000/api/documents/${documentId}/soft-delete`,
        { deleted: true },
        { withCredentials: true }
      );
      const updatedDocument = response.data;
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc._id !== documentId)
      );
      setRecycleBin((prevRecycleBin) => [...prevRecycleBin, updatedDocument]);
      toast.success("Document moved to recycle bin.");
    } catch (error) {
      console.error("Error moving document to recycle bin:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to move document to recycle bin."
      );
    }
  }, []);

  const downloadDocument = useCallback(async (documentId, filename) => {
    try {
      if (!documentId) {
        throw new Error("Invalid document ID.");
      }
      const response = await axios.get(
        `http://localhost:4000/api/documents/download/${documentId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      toast.success("Document downloaded successfully.");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(
        error.response?.data?.message || "Failed to download document."
      );
    }
  }, []);

  const restoreDocument = useCallback(async (documentId) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/documents/${documentId}/restore`,
        { deleted: false },
        { withCredentials: true }
      );
      const restoredDocument = response.data;
      setRecycleBin((prev) => prev.filter((doc) => doc._id !== documentId));
      setDocuments((prev) => [...prev, restoredDocument]);
      toast.success("Document restored successfully.");
    } catch (error) {
      handleError(error, "Failed to restore document.");
    }
  }, []);

  const fetchCollaborators = useCallback(async (workspaceId) => {
    try {
      // Validate workspace ID format
      if (!workspaceId || !workspaceId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid workspace ID");
      }

      const response = await axios.get(
        `http://localhost:4000/api/workspaces/${workspaceId}/collaborators`,
        { withCredentials: true }
      );

      // Validate the response data
      if (Array.isArray(response.data)) {
        setCollaborators(response.data);
      } else {
        console.error("Invalid data format received for collaborators");
        setCollaborators([]); // Reset collaborators if invalid data is received
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast.error("Failed to fetch collaborators.");
      setCollaborators([]); // Reset collaborators on error
    }
  }, []);

  // Add a collaborator to a workspace
  const addCollaboratorToWorkspace = useCallback(
    async (user) => {
      try {
        // Ensure a workspace is selected
        if (!selectedWorkspace || !selectedWorkspace._id) {
          throw new Error("No workspace selected");
        }

        // Ensure the collaborator and role are valid
        if (!user || !user._id) {
          throw new Error("Invalid collaborator details");
        }
        if (
          !selectedRole ||
          !["Viewer", "Editor", "Admin"].includes(selectedRole)
        ) {
          throw new Error("Invalid role selected");
        }

        // Send the request to add the collaborator
        await axios.post(
          `http://localhost:4000/api/workspaces/${selectedWorkspace._id}/add-collaborator`,
          { userId: user._id, role: selectedRole }, // Adjusted payload to match the new backend structure
          { withCredentials: true }
        );

        toast.success(`${user.username} added as ${selectedRole}.`);

        // Refetch collaborators to update the list
        fetchCollaborators(selectedWorkspace._id);
      } catch (error) {
        console.error("Error adding collaborator:", error);
        toast.error(
          error.response?.data?.message || "Error adding collaborator."
        );
      }
    },
    [selectedWorkspace, selectedRole, fetchCollaborators]
  );

  const searchDocuments = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const searchDocumentsWithParams = useCallback(async (searchParams) => {
    try {
      const { name, metadata, tags } = searchParams;

      // Construct the query string based on available search parameters
      const query = new URLSearchParams();

      if (name) query.append("name", name);
      if (metadata) query.append("metadata", metadata);
      if (tags) query.append("tags", tags);

      const response = await axios.get(
        `http://localhost:4000/api/documents/search?${query.toString()}`,
        {
          withCredentials: true,
        }
      );

      setFilteredDocuments(response.data || []);
    } catch (error) {
      handleError(error, "Failed to search documents.");
    }
  }, []);

  const filteredDocs = useMemo(() => {
    return Array.isArray(documents)
      ? documents.filter((document) =>
          document.name
            ? document.name.toLowerCase().includes(searchTerm.toLowerCase())
            : false
        )
      : [];
  }, [documents, searchTerm]);

  // Function to search public workspaces
  const searchPublicWorkspaces = useCallback(async (term) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/workspaces/search?q=${term}`,
        {
          withCredentials: true,
        }
      );
      setFilteredWorkspaces(response.data || []);
    } catch (error) {
      handleError(error, "Failed to search workspaces.");
    }
  }, []);

  // Filter documents locally based on search term

  const previewDocument = useCallback(async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/preview/${documentId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Failed to preview document.");
    }
  }, []);

  const updateDocumentMetadata = useCallback(async (documentId, metadata) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/documents/${documentId}/metadata`,
        metadata,
        { withCredentials: true }
      );
      const updatedDocument = response.data;
      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc._id === documentId ? updatedDocument : doc
        )
      );
      toast.success("Document metadata updated successfully.");
    } catch (error) {
      console.error("Error updating document metadata:", error);
      toast.error("Failed to update document metadata.");
    }
  }, []);

  // Fetch document metadata
  const getDocumentMetadata = useCallback(async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/${documentId}/metadata`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document metadata:", error);
      toast.error("Failed to fetch document metadata.");
    }
  }, []);

  // Update document tags
  const updateDocumentTags = useCallback(async (documentId, tags) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/documents/${documentId}/tags`,
        { tags },
        { withCredentials: true }
      );
      const updatedDocument = response.data;
      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc._id === documentId ? updatedDocument : doc
        )
      );
      toast.success("Document tags updated successfully.");
    } catch (error) {
      console.error("Error updating document tags:", error);
      toast.error("Failed to update document tags.");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWorkspacesByUser();
    }
  }, [isAuthenticated, user, fetchWorkspacesByUser]);

  const contextValue = useMemo(
    () => ({
      loading,
      workspaces,
      documents,
      deleteDocument,
      downloadDocument,
      recycleBin,
      filteredDocuments,
      filteredWorkspaces,
      createWorkspace,
      deleteWorkspace,
      fetchWorkspacesByUser,
      fetchDocuments,
      searchPublicWorkspaces,
      uploadDocument,
      restoreDocument,
      addCollaboratorToWorkspace,
      previewDocument,
      fetchCollaborators,
      updateDocumentMetadata,
      showPreviewModal,
      setShowPreviewModal,
      previewFile,
      setPreviewFile,
      selectedWorkspace,
      setSelectedWorkspace,
      getDocumentMetadata,
      updateDocumentTags,
      searchDocuments,
      collaborators,
      setCollaborators,
      selectedRole,
      setSelectedRole,
      searchDocumentsWithParams,
      filteredDocs,
    }),
    [
      loading,
      workspaces,
      documents,
      deleteDocument,
      downloadDocument,
      recycleBin,
      filteredDocuments,
      filteredWorkspaces,
      createWorkspace,
      deleteWorkspace,
      fetchWorkspacesByUser,
      fetchDocuments,
      searchPublicWorkspaces,
      uploadDocument,
      restoreDocument,
      addCollaboratorToWorkspace,
      previewDocument,
      fetchCollaborators,
      updateDocumentMetadata,
      showPreviewModal,
      previewFile,
      selectedWorkspace,
      getDocumentMetadata,
      updateDocumentTags,
      searchDocuments,
      collaborators,
      selectedRole,
      searchDocumentsWithParams,
      filteredDocs,
    ]
  ); // Add relevant dependencies

  // Fetch workspaces once authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWorkspacesByUser();
    }
  }, [isAuthenticated, user, fetchWorkspacesByUser]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Prop types validation
DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardProvider;
