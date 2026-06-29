import { CheckCircle2, PlusCircleIcon, MoreVertical } from "lucide-react";
import Sidebar from "../HomeComponent/Sidebar";
import "../HomeComponent/home.css";
import "./workspace.css";
import WebdesignImg from "../../assets/images/website design.png";
import codeImg from "../../assets/images/code windows.png";
import megaphone from "../../assets/images/megaphone marketing.png";
import AIImg from "../../assets/images/AiImg.png";
import BugImg from "../../assets/images/bug.png";
import ProImg from "../../assets/images/product.png";
import VoltImg from "../../assets/images/energy-ellipse.png";
import { useNavigate } from "react-router-dom";
import CreateNewWorkspace from "./CreateNewWorkspace";
import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import Swal from "sweetalert2";
import {
  getWorkspaces,
  getApiErrorMessage,
  softDeleteWorkspace,
  updateWorkspace,
} from "../../services/api";

const CARD_IMAGES = [
  WebdesignImg,
  codeImg,
  megaphone,
  AIImg,
  BugImg,
  ProImg,
];

function cardImageForIndex(i) {
  return CARD_IMAGES[i % CARD_IMAGES.length];
}

const MainWorkspace = () => {
  const navigate = useNavigate();
  const { setActiveWorkspace } = useWorkspace();
  
  console.log("MainWorkspace component rendering");
  
  const [list, setList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  // Simple useEffect to call getWorkspaces()
  useEffect(() => {
    const loadWorkspaces = async () => {
      // Check for token before making request
      const token = localStorage.getItem('userToken') ||
                    localStorage.getItem('token') ||
                    localStorage.getItem('auth_token') ||
                    localStorage.getItem('accessToken');

      if (!token) {
        console.warn("No token found - skipping API request to prevent 401 errors");
        setList([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await getWorkspaces();
        console.log("API Response:", res.data);

        // Handle different response formats
        let workspaces = [];
        if (Array.isArray(res.data)) {
          workspaces = res.data;
        } else if (Array.isArray(res.data?.items)) {
          workspaces = res.data.items;
        } else if (Array.isArray(res.data?.data)) {
          workspaces = res.data.data;
        }

        setList(workspaces);
      } catch (e) {
        console.error("Failed to load workspaces:", e);

        // Immediate 401 authentication check
        if (e?.response?.status === 401) {
          alert("Authentication Error: 401 Unauthorized - Please check the userToken in localStorage");
        }

        setError(e?.response?.data?.message || e?.message || "Failed to load workspaces");
        setList([]); // fallback to empty array on error so UI doesn't crash
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, []); // Empty dependency array - runs once on mount

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.workspace-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);


  const workspaces = useMemo(() => list, [list]);

  function openWorkspace(ws) {
    setActiveWorkspace(ws);
    navigate("/workspaceoverview");
  }

  async function handleDeleteWorkspace(id) {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete workspace?",
      text: "This will archive the workspace. You can restore it later.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!confirmed.isConfirmed) return;
    try {
      await softDeleteWorkspace(id);
      await Swal.fire({ icon: "success", text: "Workspace deleted." });
      reloadWorkspaces();
    } catch (e) {
      await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
    }
  }

  function handleEditWorkspace(ws) {
    setEditingWorkspace(ws);
    setEditModalOpen(true);
  }

  async function handleUpdateWorkspace(id, payload) {
    try {
      await updateWorkspace(id, payload);
      setEditModalOpen(false);
      setEditingWorkspace(null);
      await Swal.fire({ icon: "success", text: "Workspace updated." });
      reloadWorkspaces();
    } catch (e) {
      await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
    }
  }

  // Function to reload workspaces after creation
  const reloadWorkspaces = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWorkspaces();
      console.log("API Response after reload:", res.data);
      let workspaces = [];
      if (Array.isArray(res.data)) {
        workspaces = res.data;
      } else if (Array.isArray(res.data?.items)) {
        workspaces = res.data.items;
      } else if (Array.isArray(res.data?.data)) {
        workspaces = res.data.data;
      }
      setList(workspaces);
    } catch (e) {
      console.error("Failed to reload workspaces:", e);
      if (e?.response?.status === 401) {
        alert("Authentication Error: 401 Unauthorized - Please check the userToken in localStorage");
      }
      setError(e?.response?.data?.message || e?.message || "Failed to load workspaces");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container workspace-module" dir="auto">
      <Sidebar />
      <main
        className="main-content"
        style={{ marginInlineStart: "160px" }}
      >
        <div className="workspace-the-top">
          <div>
            <h1 style={{ marginBottom: "0", fontWeight: "900" }}>Workspaces</h1>
            <p style={{ marginTop: "0", color: "#4c4c4c" }}>
              Manage your projects, tasks and notes in one place.
            </p>
          </div>
          <button
            type="button"
            style={{ cursor: "pointer" }}
            onClick={() => setOpenDialog(true)}
          >
            New Workspace
          </button>
        </div>

        {/* Commented out search toolbar for now */}
        {/* <div
          className="workspace-toolbar"
          style={{
            margin: "12px 30px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              minWidth: "240px",
              flex: "1",
              maxWidth: "400px",
            }}
          >
            <Search size={18} color="#64748b" aria-hidden />
            <input
              type="search"
              placeholder="Search workspaces…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "15px",
                background: "transparent",
              }}
            />
          </div>
          {loading && (
            <span style={{ color: "#64748b", fontSize: "14px" }}>Loading…</span>
          )}
        </div> */}

        <div style={{ margin: "12px 30px" }}>
          {loading && (
            <span style={{ color: "#64748b", fontSize: "14px" }}>Loading…</span>
          )}
        </div>

        {error ? (
          <div className="workspace-api-banner workspace-api-banner--error" role="alert">
            {error}
          </div>
        ) : null}

{/* Success message - COMMENTED OUT for testing */}
        {/* {successMessage ? (
          <div 
            className="workspace-api-banner workspace-api-banner--success" 
            role="status"
            style={{
              margin: "12px 30px",
              padding: "12px 16px",
              backgroundColor: "#dcfce7",
              color: "#166534",
              borderRadius: "8px",
              border: "1px solid #86efac",
            }}
          >
            {successMessage}
          </div>
        ) : null} */}

        <div className="page-container">
          <div className="cards-container">
            {/* Debug: Show workspace count */}
            {console.log("Workspaces to render:", workspaces?.length || 0, workspaces)}
            
            {workspaces && workspaces.length > 0 ? (
              workspaces.map((ws, idx) => (
              <div
                key={ws?.id ?? idx}
                className="card workspace-card-wrapper"
                style={{
                  position: "relative",
                  textAlign: "inherit",
                  font: "inherit",
                  color: "inherit",
                  overflow: "visible",
                }}
              >
                {/* Three Dots Menu */}
                <div className="workspace-menu" style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === ws.id ? null : ws.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      padding: "4px",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 20,
                    }}
                    aria-label="Workspace options"
                  >
                    <MoreVertical size={20} color="#64748b" />
                  </button>

                  {openMenuId === ws.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "35px",
                        right: "10px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        border: "1px solid #e2e8f0",
                        minWidth: "150px",
                        zIndex: 30,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          handleEditWorkspace(ws);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          textAlign: "left",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        Edit Workspace
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          handleDeleteWorkspace(ws.id);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          textAlign: "left",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#dc2626",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        Delete Workspace
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="workspace-card-btn"
                  onClick={() => openWorkspace(ws)}
                  style={{
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    width: "100%",
                    textAlign: "inherit",
                    font: "inherit",
                    color: "inherit",
                    padding: "0",
                  }}
                >
                  <img src={cardImageForIndex(idx)} alt="" />
                  <h4>{ws?.name || "Workspace"}</h4>
                  {ws?.description && (
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                      {ws?.description?.length > 60 
                        ? ws?.description?.substring(0, 60) + "..." 
                        : ws?.description}
                    </p>
                  )}
                  <div style={{ marginTop: "12px" }}>
                    <p>{ws?.members?.length || ws?.membersCount || 0} Members</p>
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                      }}
                    >
                      <span style={{ fontSize: "15px", marginTop: "auto" }}>
                        <CheckCircle2 />
                      </span>
                      {ws?.tasks?.length || ws?.tasksCount || 0} Tasks
                    </p>
                  </div>
                </button>
              </div>
            ))
            ) : (
              !loading && <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>No workspaces found.</p>
            )}

            <button
              type="button"
              className="card add"
              onClick={() => setOpenDialog(true)}
            >
              <span style={{ marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlusCircleIcon size={32} color="#989898" />
              </span>
              <h5 style={{ margin: 0, color: "#989898", fontSize: "14px", fontWeight: 500, textAlign: "center" }}>Add workspace</h5>
            </button>
          </div>

          <div className="insights">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <img src={VoltImg} alt="" />
              <div>
                <h2 style={{ marginBottom: "0px" }}>Projects insights</h2>
                <p style={{ marginTop: "0px", color: "#616483" }}>
                  {workspaces.length
                    ? "Open a workspace to track focus time and team activity."
                    : "Create a workspace to start collaborating."}
                </p>
              </div>
            </div>
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "25px",
                color: "#22236f",
                fontWeight: "700",
              }}
            >
              <p>View reports</p>
              <p>dismiss</p>
            </div>
          </div>
        </div>
        {openDialog ? (
          <CreateNewWorkspace
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            onCreated={(createdWorkspace) => {
              console.log("Workspace created successfully:", createdWorkspace);
              // CRITICAL: Re-call getWorkspaces to refresh the list
              reloadWorkspaces();
            }}
          />
        ) : null}

        {/* Edit Workspace Modal */}
        {editModalOpen && editingWorkspace ? (
          <EditWorkspaceModal
            workspace={editingWorkspace}
            onClose={() => {
              setEditModalOpen(false);
              setEditingWorkspace(null);
            }}
            onUpdate={handleUpdateWorkspace}
          />
        ) : null}
      </main>
    </div>
  );
};
export default MainWorkspace;

// Edit Workspace Modal Component
function EditWorkspaceModal({ workspace, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: workspace.name || "",
    description: workspace.description || "",
    iconCode: workspace.iconCode || "default",
    visibility: workspace.visibility ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        iconCode: formData.iconCode,
        visibility: parseInt(formData.visibility, 10),
      };
      
      await onUpdate(workspace.id, updateData);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          minWidth: "400px",
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "16px" }}>Edit Workspace</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "14px",
                minHeight: "80px",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>
              Visibility
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: parseInt(e.target.value) })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value={0}>Private</option>
              <option value={1}>Team</option>
              <option value={2}>Public</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{submitting ? "Updating…" : "Update"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
