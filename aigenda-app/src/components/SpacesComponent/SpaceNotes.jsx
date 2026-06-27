import Header from "../HomeComponent/Header";
import "../HomeComponent/home.css";
import TopSection from "../WorkspacesComponent/TopSection";
import "../WorkspacesComponent/workspace.css";
import Avtar1 from "../../assets/images/avatar1.jpg";
import Avtar2 from "../../assets/images/avatar2.jpg";
import { Clock, HeartIcon, MoreVertical, PinIcon, Plus, PlusCircleIcon } from "lucide-react";
import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace";
import { useState } from "react";
import CreateNote from "../NoteComponent/CreateNote";
import ImgNote from "../NoteComponent/ImgNote";
import VoiceNote from "../NoteComponent/VoiceNote";
import { useSpaces } from "../../context/SpacesContext";

// Mock notes data with spaceId
const mockNotes = [
  {
    id: 1,
    spaceId: "space-1",
    title: "Color Palette Accessibility Review",
    category: "UX RESEARCH",
    categoryColor: "#dbeafe",
    categoryTextColor: "#2563eb",
    content: "Gathered references for the Digital Innovation section. Focus on glassmorphism, depth, and vibrant…",
    edited: "5h ago",
    hasImage: false
  },
  {
    id: 2,
    spaceId: "space-1",
    title: "New Icon Set Library",
    category: "ASSETS",
    categoryColor: "#fef3c7",
    categoryTextColor: "#d97706",
    content: "We are moving towards a more rounded icon aesthetic. These should be 24px default with a 1.5pt stroke…",
    edited: "5h ago",
    hasImage: true,
    image: Avtar1
  },
  {
    id: 3,
    spaceId: "space-1",
    title: "Developer Handoff Protocol",
    category: "TYPOGRAPHY",
    categoryColor: "#d1fae5",
    categoryTextColor: "#059669",
    content: "Gathered references for the Digital Innovation section. Focus on glassmorphism, depth, and vibrant…",
    edited: "5h ago",
    hasImage: false
  },
  {
    id: 4,
    spaceId: "space-1",
    title: "Developer Handoff Protocol",
    category: "WORKFLOW",
    categoryColor: "#f3e8ff",
    categoryTextColor: "#9333ea",
    content: "Gathered references for the Digital Innovation section. Focus on glassmorphism, depth, and vibrant…",
    edited: "5h ago",
    hasImage: false
  },
  {
    id: 5,
    spaceId: "space-1",
    title: "Landing Page Moodboard",
    category: "IDEATION",
    categoryColor: "#ffe4e6",
    categoryTextColor: "#e11d48",
    content: "Gathered references for the Digital Innovation section. Focus on glassmorphism, depth, and vibrant…",
    edited: "5h ago",
    hasImage: true,
    image: Avtar2
  }
];

const SpaceNotes = () => {
  const [openCreateNote, setOpenCreateNote] = useState(false);
  const [openNoteType, setOpenNoteType] = useState({
    voice:false,
    image:false
  });
  const { spaces, activeSpaceId } = useSpaces();

  // Get current space from context
  const currentSpace = spaces?.find(s => String(s.id) === String(activeSpaceId));
  const spaceName = currentSpace?.name || "No Space Selected";
  const spaceDescription = currentSpace?.description || "No description available for this space.";

  // Filter notes by active space (safe with fallback)
  const filteredNotes = (mockNotes || []).filter(note => String(note.spaceId) === String(activeSpaceId));

  return (
    <div className="app-container">
      <SidebarofWorkspace />
      <main className="main-content" style={{ marginLeft: "180px",boxSizing:'border-box' }}>
        <Header />
        <div className="page-container" style={{position:'relative'}}>
          <TopSection spaceName={`${spaceName}`} spaceDescription={spaceDescription} />
          <button onClick={()=>{setOpenCreateNote(true)}}>
            <span><PlusCircleIcon/></span>
            Create Note</button>
          <div className="notes-container">
            {filteredNotes && filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div key={note.id} className={`note-box ${note.hasImage ? 'image' : ''}`}>
                  {note.hasImage && <img src={note.image} />}
                  <div className="inside-box">
                    <div className="top-section">
                      <div style={{ backgroundColor: note.categoryColor, color: note.categoryTextColor }}>
                        {note.category}
                      </div>
                      <button>
                        <MoreVertical />
                      </button>
                    </div>
                    <h2>{note.title}</h2>
                    <p>
                      {note.content}
                    </p>

                    <div className="bottom-section">
                      <div>
                        <span>
                          <Clock />
                        </span>
                        Edited {note.edited}
                      </div>
                      <button>
                        <HeartIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8c9196' }}>
                <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No notes found in this space.</p>
                <p style={{ fontSize: '0.875rem' }}>Click 'Create Note' to start capturing your ideas!</p>
              </div>
            )}
            <div className="note-box create" style={{display:'flex',alignItems:"center",justifyContent:'center',flexDirection:'column'}}>
                <button><PlusCircleIcon/></button>
              <h4 style={{color:'#475569',marginBottom:'0'}}>Create new note</h4>
              <h5 style={{color:'#94A3B8',marginTop:'0'}}>Capture ideas instantly</h5>
            </div>
          </div>
        </div>
      </main>
      {openCreateNote && <CreateNote openCreateNote={openCreateNote} setOpenCreateNote={setOpenCreateNote} setOpenNoteType={setOpenNoteType} openNoteType={openNoteType}/>}
      {openNoteType.voice && <VoiceNote setOpenNoteType={setOpenNoteType} openNoteType={openNoteType}/>}
      {openNoteType.image && <ImgNote setOpenNoteType={setOpenNoteType} openNoteType={openNoteType}/>}
    </div>
  );
};
export default SpaceNotes;
