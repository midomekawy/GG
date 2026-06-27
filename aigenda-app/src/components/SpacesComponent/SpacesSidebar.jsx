import React, { useState } from "react";
import { Plus, ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useSpaces } from "../../context/SpacesContext";
import CreateSpaceModal from "./CreateSpaceModal";
import "./spaces.css";

const SpacesSidebar = ({ workspaceId }) => {
  const {
    spaces,
    activeSpaceId,
    selectSpace,
    activeTab,
    setActiveTab,
    createSpace,
    updateSpace,
    deleteSpace,
    moveSpace,
  } = useSpaces();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [expandedSpaceId, setExpandedSpaceId] = useState(activeSpaceId);
  const [menuOpenId, setMenuOpenId] = useState(null);

  console.log("🔥 [SpacesSidebar] Rendering with spaces from context:", spaces);

  const handleSpaceClick = (spaceId) => {
    selectSpace(spaceId);
    setExpandedSpaceId(spaceId === expandedSpaceId ? null : spaceId);
  };

  const handleCreateSpace = () => {
    setShowCreateModal(true);
  };

  const handleEditSpace = (space) => {
    setEditingSpace(space);
    setShowEditModal(true);
    setMenuOpenId(null);
  };

  const handleUpdateSpace = () => {
    if (editingSpace) {
      const name = prompt("Enter new name:", editingSpace.name);
      const description = prompt("Enter new description:", editingSpace.description);
      if (name) {
        updateSpace(editingSpace.id, { name, description });
      }
      setShowEditModal(false);
      setEditingSpace(null);
    }
  };

  const handleDeleteSpace = (spaceId) => {
    if (confirm("Are you sure you want to delete this space?")) {
      deleteSpace(spaceId);
      setMenuOpenId(null);
    }
  };

  const handleMoveSpace = (spaceId, direction) => {
    moveSpace(spaceId, direction);
    setMenuOpenId(null);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="spaces-sidebar">
      <div className="spaces-header">
        <h3>SPACES</h3>
        <button
          className="add-space-btn"
          onClick={handleCreateSpace}
          title="Add New Space"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="spaces-list">
        {spaces && spaces.length > 0 ? (
          spaces.map((space) => (
            <div key={space.id} className="space-item">
              <div
                className={`space-header ${activeSpaceId === space.id ? "active" : ""}`}
                onClick={() => handleSpaceClick(space.id)}
              >
                <div className="space-info">
                  <span className="space-name">{space.name}</span>
                  {expandedSpaceId === space.id ? (
                    <ChevronUp size={16} className="expand-icon" />
                  ) : (
                    <ChevronDown size={16} className="expand-icon" />
                  )}
                </div>
                <button
                  className="space-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === space.id ? null : space.id);
                  }}
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {menuOpenId === space.id && (
                <div className="space-dropdown-menu">
                  <button onClick={() => handleEditSpace(space)}>
                    <Edit size={14} />
                    Edit
                  </button>
                  <button onClick={() => handleMoveSpace(space.id, "up")}>
                    <ArrowUp size={14} />
                    Move Up
                  </button>
                  <button onClick={() => handleMoveSpace(space.id, "down")}>
                    <ArrowDown size={14} />
                    Move Down
                  </button>
                  <button onClick={() => handleDeleteSpace(space.id)} className="delete-btn">
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}

              {expandedSpaceId === space.id && activeSpaceId === space.id && (
                <div className="space-tabs">
                  {space.views && space.views.map((view) => (
                    <button
                      key={view}
                      className={`space-tab ${activeTab === view ? "active" : ""}`}
                      onClick={() => handleTabClick(view)}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: "#8c9196", fontSize: "13px", padding: "0 10px" }}>
            No spaces available
          </p>
        )}
      </div>

      {showEditModal && editingSpace && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Space</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                defaultValue={editingSpace.name}
                id="edit-space-name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                defaultValue={editingSpace.description}
                id="edit-space-description"
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleUpdateSpace}>Update</button>
            </div>
          </div>
        </div>
      )}

      <CreateSpaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default SpacesSidebar;
