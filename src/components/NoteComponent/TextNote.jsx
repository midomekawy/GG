import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSpaces } from "../../context/SpacesContext";

const TextNote = ()=>{
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const editorRef = useRef(null);
  const { createSpaceNote } = useSpaces();

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== noteContent) {
      editorRef.current.innerHTML = noteContent;
    }
  }, [noteContent]);

  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    setNoteContent(editorRef.current?.innerHTML || '');
    setIsFormatting((prev) => !prev);
  };
    return(
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', fontFamily: 'sans-serif', padding: '100px 20px 20px 20px' }}>
            {/* header */}
            <div style={{
            position: 'fixed',
            top: 0,            
            left: 0,           
            width: '100%',     
            zIndex: 100,       
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            borderRadius: '0 0 10px 10px',
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to={'/workspacenotes'}>
            <div style={{ color: '#2610b2', backgroundColor: '#e0e3ef', borderRadius: '28px', width: '28px', height: '28px', alignItems: 'center', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} />
            </div>
            </Link>
            <p style={{ fontWeight: 'bold', margin: 0 }}>{noteTitle || 'Tech Req'}</p>
            <p style={{ color: '#a9a9a9', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '10px' }}>●</span> New text note
            </p>
            </div>

            <button
            type="button"
            onClick={async () => {
              if (!noteTitle.trim()) return;
              setIsSaving(true);
              try {
                await createSpaceNote(
                  localStorage.getItem("aigendaActiveWorkspaceId"),
                  localStorage.getItem("aigendaActiveSpaceId"),
                  {
                    type: 'text',
                    title: noteTitle.trim(),
                    content: noteContent,
                  }
                );
              } finally {
                setIsSaving(false);
              }
            }}
            style={{ 
            width: '120px', 
            backgroundColor: '#6918cf', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '500',
            opacity: isSaving ? 0.7 : 1
            }}>
            {isSaving ? 'Saving...' : 'Save Note'}
            </button>
            </div>
            {/* note */}
            <div style={{ 
            maxWidth: '850px', 
            margin: '0 auto', 
            backgroundColor: 'white', 
            boxShadow: '0 4px 20px rgba(125, 125, 125, 0.4)', 
            borderRadius: '8px',
            overflow: 'hidden',
            minHeight: '900px',
            border:'none',
            }}>
            <div style={{ padding: '18px 24px 0' }}>
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Choose a title..."
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '16px' }}
              />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px 10px 0 0', borderBottom: 'none', background: '#fafafa', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => execFormat('bold')} style={toolbarButtonStyle} aria-label="Bold"><strong>B</strong></button>
                <button type="button" onClick={() => execFormat('italic')} style={toolbarButtonStyle} aria-label="Italic"><em>I</em></button>
                <button type="button" onClick={() => execFormat('underline')} style={toolbarButtonStyle} aria-label="Underline"><u>U</u></button>
                <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }} />
                <button type="button" onClick={() => execFormat('formatBlock', 'h1')} style={toolbarButtonStyle}>H1</button>
                <button type="button" onClick={() => execFormat('formatBlock', 'h2')} style={toolbarButtonStyle}>H2</button>
                <button type="button" onClick={() => execFormat('insertUnorderedList')} style={toolbarButtonStyle}>• List</button>
                <button type="button" onClick={() => execFormat('removeFormat')} style={toolbarButtonStyle}>Clear</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                onBlur={(e) => setNoteContent(e.currentTarget.innerHTML)}
                data-placeholder="Start writing your note here..."
                style={{ minHeight: '760px', border: '1px solid #e2e8f0', borderRadius: '0 0 10px 10px', padding: '14px', fontSize: '16px', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            </div>
        </div>
    )
};

const toolbarButtonStyle = {
  border: '1px solid #d8cfff',
  background: '#ffffff',
  color: '#4c1d95',
  borderRadius: '8px',
  padding: '6px 10px',
  cursor: 'pointer',
  fontWeight: 700,
};
export default TextNote;