import Header from "../HomeComponent/Header";
import "../HomeComponent/home.css";
import TopSection from "../WorkspacesComponent/TopSection";
import "../WorkspacesComponent/workspace.css";
import { Clock, HeartIcon, PlusCircleIcon, Trash2 } from "lucide-react";
import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace";
import { useState } from "react";
import CreateNote from "../NoteComponent/CreateNote";
import ImgNote from "../NoteComponent/ImgNote";
import VoiceNote from "../NoteComponent/VoiceNote";
import DrawingPreview from "../NoteComponent/DrawingPreview";
import NoteDetail from "../NoteComponent/NoteDetail";
import { useSpaces } from "../../context/SpacesContext";

const SpaceNotes = () => {
  const [openCreateNote, setOpenCreateNote] = useState(false);
  const [openNoteType, setOpenNoteType] = useState({
    voice: false,
    image: false,
    text: false,
    draw: false,
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const { spaces, activeSpaceId, getSpaceNotes, fetchSpaceNotes, notesLoading, notesError, createSpaceNote, updateSpaceNote, deleteSpaceNote } = useSpaces();

  // Get current space from context
  const currentSpace = spaces?.find(s => String(s.id) === String(activeSpaceId));
  const spaceName = currentSpace?.name || "No Space Selected";
  const spaceDescription = currentSpace?.description || "No description available for this space.";

  const filteredNotes = getSpaceNotes(activeSpaceId);

  const handleOpenType = (type) => {
    setOpenCreateNote(false);
    setOpenNoteType({ voice: false, image: false, text: false, draw: false, [type]: true });
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note permanently?')) return;
    await deleteSpaceNote(
      localStorage.getItem("aigendaActiveWorkspaceId"),
      activeSpaceId,
      noteId
    );
    await fetchSpaceNotes(localStorage.getItem("aigendaActiveWorkspaceId"), activeSpaceId);
  };

  const handleCreateQuickNote = async (noteType, payload = {}) => {
    if (!activeSpaceId) return;
    await createSpaceNote(
      localStorage.getItem("aigendaActiveWorkspaceId"),
      activeSpaceId,
      {
        type: noteType,
        title: payload.title || `${noteType} note`,
        content: payload.content || "",
        imageUrl: payload.imageUrl || "",
        audioUrl: payload.audioUrl || "",
        drawingData: payload.drawingData || null,
        audioFile: payload.audioFile || null,
        audioFileName: payload.audioFileName || undefined,
        imageFile: payload.imageFile || null,
        imageFileName: payload.imageFileName || undefined,
      }
    );
    await fetchSpaceNotes(localStorage.getItem("aigendaActiveWorkspaceId"), activeSpaceId);
  };

  const renderNoteCard = (note) => {
    const edited = note.updatedAt || note.createdAt;
    const editedLabel = edited ? `Edited ${new Date(edited).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Edited recently';
    const isImage = note.type === 'image' || !!note.imageUrl;
    const isVoice = note.type === 'voice';
    const isDraw = note.type === 'draw';

    return (
      <div
        key={note.id}
        className={`note-box ${isImage ? 'image' : ''}`}
        onClick={() => setSelectedNote(note)}
        style={{ cursor: 'pointer' }}
      >
        {isImage && <img src={note.imageUrl} alt={note.title || 'Note attachment'} />}
        <div className="inside-box">
          <div className="top-section">
            <div style={{ backgroundColor: note.categoryColor || '#f3e8ff', color: note.categoryTextColor || '#7c3aed' }}>
              {String(note.type || 'note').toUpperCase()}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              aria-label="Delete note"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <h2>{note.title}</h2>
          {isVoice ? (
            <audio
              controls
              src={note.audioUrl}
              style={{ width: '100%', marginBottom: '8px' }}
            >
              Your browser does not support the audio element.
            </audio>
          ) : isDraw ? (
            <div style={{ marginBottom: '8px' }}>
              <DrawingPreview drawingData={note.drawingData} />
            </div>
          ) : (
            <p>{note.content || 'No content yet.'}</p>
          )}

          <div className="bottom-section">
            <div>
              <span>
                <Clock />
              </span>
              {editedLabel}
            </div>
            <button type="button">
              <HeartIcon />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const openCreateNoteSheet = () => setOpenCreateNote(true);

  return (
    <div className="app-container">
      <SidebarofWorkspace />
      <main className="main-content" style={{ marginLeft: "var(--workspace-sidebar-width, 256px)", boxSizing:'border-box' }}>
        <Header />
        <div className="page-container" style={{position:'relative'}}>
          <TopSection spaceName={`${spaceName}`} spaceDescription={spaceDescription} />
          <button onClick={openCreateNoteSheet}>
            <span><PlusCircleIcon/></span>
            Create Note</button>
          <div className="notes-container">
            {notesError ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>
                <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>{notesError}</p>
              </div>
            ) : notesLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8c9196' }}>
                Loading notes...
              </div>
            ) : filteredNotes && filteredNotes.length > 0 ? (
              filteredNotes.map((note) => renderNoteCard(note))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8c9196' }}>
                <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No notes found in this space.</p>
                <p style={{ fontSize: '0.875rem' }}>Click 'Create Note' to start capturing your ideas!</p>
              </div>
            )}
            <div
              className="note-box create"
              role="button"
              tabIndex={0}
              onClick={openCreateNoteSheet}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openCreateNoteSheet();
                }
              }}
              style={{display:'flex',alignItems:"center",justifyContent:'center',flexDirection:'column',cursor:'pointer'}}
            >
                <button type="button" onClick={openCreateNoteSheet}><PlusCircleIcon/></button>
              <h4 style={{color:'#475569',marginBottom:'0'}}>Create new note</h4>
              <h5 style={{color:'#94A3B8',marginTop:'0'}}>Capture ideas instantly</h5>
            </div>
          </div>
        </div>
      </main>
      {openCreateNote && <CreateNote openCreateNote={openCreateNote} setOpenCreateNote={setOpenCreateNote} setOpenNoteType={setOpenNoteType} openNoteType={openNoteType} onSelectType={handleOpenType}/>} 
      {openNoteType.voice && <VoiceNote setOpenNoteType={setOpenNoteType} openNoteType={openNoteType} onSave={(payload) => handleCreateQuickNote('voice', payload)}/>} 
      {openNoteType.image && <ImgNote setOpenNoteType={setOpenNoteType} openNoteType={openNoteType} onSave={(payload) => handleCreateQuickNote('image', payload)}/>} 
      {selectedNote && (
        <NoteDetail
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onUpdate={(data) =>
            updateSpaceNote(
              localStorage.getItem("aigendaActiveWorkspaceId"),
              activeSpaceId,
              selectedNote.id,
              data
            ).then(() =>
              fetchSpaceNotes(localStorage.getItem("aigendaActiveWorkspaceId"), activeSpaceId)
            )
          }
          onDelete={() =>
            deleteSpaceNote(
              localStorage.getItem("aigendaActiveWorkspaceId"),
              activeSpaceId,
              selectedNote.id
            ).then(() =>
              fetchSpaceNotes(localStorage.getItem("aigendaActiveWorkspaceId"), activeSpaceId)
            )
          }
        />
      )}
    </div>
  );
};
export default SpaceNotes;
