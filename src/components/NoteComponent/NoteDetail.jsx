import { useState } from 'react';
import { X, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DrawingPreview from './DrawingPreview';

const NoteDetail = ({ note, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const isImage = note.type === 'image' || !!note.imageUrl;
  const isVoice = note.type === 'voice';
  const isDraw = note.type === 'draw';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({ title: title.trim(), content });
      onClose();
    } catch (err) {
      console.error('Error updating note:', err);
      alert('Failed to update note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note.');
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="create-container"
        style={{ width: '480px', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ color: '#6918cf', margin: 0 }}>
            {isImage ? 'Image Note' : isVoice ? 'Voice Note' : isDraw ? 'Drawing Note' : 'Text Note'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #6918cf',
              background: 'transparent',
              color: '#6918cf',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <label style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '16px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />

        {isImage && <img src={note.imageUrl} alt={note.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />}

        {isVoice && (
          <audio controls src={note.audioUrl} style={{ width: '100%', marginBottom: '16px' }}>
            Your browser does not support the audio element.
          </audio>
        )}

        {isDraw && (
          <div style={{ marginBottom: '16px' }}>
            <DrawingPreview drawingData={note.drawingData} />
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/drawnote?edit=${note.id}`);
              }}
              style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                background: '#6918cf',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              <Pencil size={16} />
              Edit Drawing
            </button>
          </div>
        )}

        {!isImage && !isVoice && !isDraw && (
          <>
            <label style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', minHeight: '120px', marginBottom: '16px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }}
            />
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            <Trash2 size={18} />
            Delete
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: '#e5e7eb',
                color: '#374151',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: '#6918cf',
                color: 'white',
                borderRadius: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                fontWeight: '500',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
