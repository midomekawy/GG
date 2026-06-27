import React, { useState } from "react";
import { useSpaces } from "../../context/SpacesContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import "./spaces.css";

const CreateSpaceModal = ({ open, onClose }) => {
  const { createSpace, workspaceId } = useSpaces();
  const { activeWorkspaceId } = useWorkspace();
  
  // State variables for form inputs
  const [spaceName, setSpaceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('book');
  const [privacy, setPrivacy] = useState('public');

  const handleSubmit = (e) => {
    e.preventDefault(); // Keep this fixed!
    if (!spaceName.trim()) return;

    const currentWorkspaceId = workspaceId || activeWorkspaceId;

    if (!currentWorkspaceId) {
      console.error("Workspace ID is missing!");
      alert("Cannot create space: Workspace ID is missing. Please select a workspace first.");
      return;
    }

    createSpace(currentWorkspaceId, {
      name: spaceName,
      description: description,
      iconCode: selectedIcon,
      isPublic: privacy === 'public'
    });

    // Reset and Close
    setSpaceName('');
    setDescription('');
    setSelectedIcon('book');
    setPrivacy('public');
    onClose();
  };

  const handleCancel = () => {
    setSpaceName('');
    setDescription('');
    setSelectedIcon('book');
    setPrivacy('public');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="overlay" onClick={handleCancel}>
      <div className="create-container" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#5900ca" }}>Create New Space</h2>
        <div className="form-box">
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="text">
              <label>Space Name</label>
              <input 
                placeholder="ex.marketing"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                required
              />
              <label>Description</label>
              <textarea 
                placeholder="What is this space for??"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="icons">
              <label>Select space icon</label>
              <div className="boxes">
                <div className={`box ${selectedIcon === 'book' ? 'active' : ''}`} onClick={() => setSelectedIcon('book')}>📚</div>
                <div className={`box ${selectedIcon === 'flask' ? 'active' : ''}`} onClick={() => setSelectedIcon('flask')}>🔬</div>
                <div className={`box ${selectedIcon === 'bag' ? 'active' : ''}`} onClick={() => setSelectedIcon('bag')}>💼</div>
                <div className={`box ${selectedIcon === 'light' ? 'active' : ''}`} onClick={() => setSelectedIcon('light')}>💡</div>
                <div className={`box ${selectedIcon === 'guitar' ? 'active' : ''}`} onClick={() => setSelectedIcon('guitar')}>🎸</div>
              </div>
            </div>
            
            <div className="privacy">
              <label>Privacy</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', marginTop: '10px', width: '100%' }}>
                <div className={`box ${privacy === 'public' ? 'active' : ''}`} onClick={() => setPrivacy('public')}>
                  <p style={{ fontWeight: 'bold' }}>Public</p>
                  <p>anyone can see this space</p>
                </div>
                <div className={`box ${privacy === 'private' ? 'active' : ''}`} onClick={() => setPrivacy('private')}>
                  <p style={{ fontWeight: 'bold' }}>Private</p>
                  <p>this space is only visible to you</p>
                </div>
              </div>
            </div>
            
            <div className="buttons">
              <button type="button" onClick={handleCancel}>Cancel</button>
              <button type="submit" style={{ backgroundColor: '#5a0fbd', color: 'white' }}>Create space</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceModal;
