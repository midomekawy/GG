import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
const TextNote = ()=>{
  const [noteContent, setNoteContent] = useState('');
  const modules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
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
            <p style={{ fontWeight: 'bold', margin: 0 }}>Tech Req</p>
            <p style={{ color: '#a9a9a9', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '10px' }}>●</span> New text note
            </p>
            </div>

            <button style={{ 
            width: '120px', 
            backgroundColor: '#6918cf', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '500'
            }}>
            Save Note
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
            height: '900px',
            border:'none',
            }}>
            <ReactQuill 
            theme="snow"
            value={noteContent} 
            onChange={setNoteContent} 
            modules={modules}
            placeholder="Start writing your note here..."
            style={{ height: '900px' }} />
            </div>
        </div>
    )
};
export default TextNote;