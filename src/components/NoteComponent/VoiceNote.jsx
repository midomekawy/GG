import { Mic, Pause, Play, Square, Trash2, X } from 'lucide-react';
import '../WorkspacesComponent/workSpaceStyle.css';
import '../WorkspacesComponent/workspace.css';
import { useEffect, useRef, useState } from 'react';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mp3',
    'audio/aac',
    'audio/ogg',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

const VoiceNote = ({ openNoteType, setOpenNoteType, onSave }) => {
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const mimeTypeRef = useRef('');

  const close = () => setOpenNoteType({ ...openNoteType, voice: false });

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        setError('Your browser does not support audio recording.');
        return;
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mimeTypeRef.current = mimeType;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          setError('No audio captured. Please try recording again.');
          return;
        }
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Cannot access microphone. Please allow microphone permission.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !audioBlob) return;
    setError('');
    setIsSaving(true);
    try {
      const extension = mimeTypeRef.current.includes('mp4') ? 'mp4' : mimeTypeRef.current.includes('ogg') ? 'ogg' : 'webm';
      await onSave?.({
        title: title.trim(),
        type: 'voice',
        content: 'Voice recording',
        audioFile: audioBlob,
        audioFileName: `recording.${extension}`,
      });
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      close();
    } catch (err) {
      console.warn('Audio file upload failed, trying base64 fallback:', err);
      try {
        const base64Audio = await blobToBase64(audioBlob);
        await onSave?.({
          title: title.trim(),
          type: 'voice',
          content: 'Voice recording',
          audioUrl: base64Audio,
        });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        close();
      } catch (fallbackErr) {
        console.error('Base64 fallback also failed:', fallbackErr);
        const message =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          'Failed to save voice note. Please try again.';
        setError(typeof message === 'string' ? message : 'Failed to save voice note.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="overlay" onClick={close}>
      <div className="create-container" style={{ width: '376px' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#6918cf', marginTop: '0' }}>Record New Note</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          style={{ width: '100%', marginBottom: '16px' }}
        />

        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            margin: '16px 0',
            gap: '16px',
          }}
        >
          {!isRecording && !audioBlob && (
            <button
              type="button"
              onClick={startRecording}
              style={{
                width: '109px',
                height: '109px',
                borderRadius: '50%',
                backgroundColor: '#6918cf',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Mic size={50} />
            </button>
          )}

          {isRecording && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#1f2937' }}>
                {formatTime(recordingTime)}
              </div>
              <button
                type="button"
                onClick={stopRecording}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Square size={24} fill="currentColor" />
              </button>
              <p style={{ color: '#ef4444', fontSize: '13px' }}>Recording...</p>
            </div>
          )}

          {!isRecording && audioBlob && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                type="button"
                onClick={togglePlayback}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: '#6918cf',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
              </button>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>{formatTime(recordingTime)}</p>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            marginTop: '24px',
          }}
        >
          {audioBlob && !isRecording && (
            <button
              type="button"
              onClick={discardRecording}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              <span
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={20} />
              </span>
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={close}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <span
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </span>
            Cancel
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !title.trim() || !audioBlob}
          style={{
            marginTop: '24px',
            width: '100%',
            backgroundColor: '#6918cf',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: !title.trim() || !audioBlob ? 'not-allowed' : 'pointer',
            opacity: !title.trim() || !audioBlob ? 0.6 : 1,
            fontWeight: '500',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Voice Note'}
        </button>
      </div>
    </div>
  );
};

export default VoiceNote;
