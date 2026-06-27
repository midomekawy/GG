import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

const DEFAULT_AVATAR =
  "https://picsum.photos/seed/user/200/200";

export default function AvatarUpload({
  currentAvatarUrl,
  uploading,
  onUploadAvatar,
  onDeleteAvatar,
}) {
  const inputRef = useRef(null);
  const selectedObjectUrlRef = useRef(null);

  const [localPreviewUrl, setLocalPreviewUrl] = useState(currentAvatarUrl || DEFAULT_AVATAR);

  useEffect(() => {
    // When the server avatar changes, reset the local preview (and discard any selected preview).
    if (selectedObjectUrlRef.current) {
      URL.revokeObjectURL(selectedObjectUrlRef.current);
      selectedObjectUrlRef.current = null;
    }
    setLocalPreviewUrl(currentAvatarUrl || DEFAULT_AVATAR);
  }, [currentAvatarUrl]);

  useEffect(() => {
    return () => {
      if (selectedObjectUrlRef.current) {
        URL.revokeObjectURL(selectedObjectUrlRef.current);
      }
    };
  }, []);

  const disabled = uploading;
  const avatarSrc = useMemo(() => localPreviewUrl || DEFAULT_AVATAR, [localPreviewUrl]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately (before upload finishes).
    const objectUrl = URL.createObjectURL(file);
    if (selectedObjectUrlRef.current) URL.revokeObjectURL(selectedObjectUrlRef.current);
    selectedObjectUrlRef.current = objectUrl;
    setLocalPreviewUrl(objectUrl);

    try {
      await onUploadAvatar(file);
    } finally {
      // Allow selecting the same file again later.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function triggerFilePicker() {
    if (!inputRef.current) return;
    inputRef.current.click();
  }

  return (
    <div className="profile-avatar-actions">
      <img className="profile-avatar-large" src={avatarSrc} alt="User avatar" />

      <div style={{ display: "flex", gap: "1rem", width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          className="avatar-change-btn"
          onClick={triggerFilePicker}
          disabled={disabled}
        >
          {uploading ? "Uploading..." : "Change Photo"}
        </button>

        <button
          type="button"
          className="avatar-delete-btn"
          onClick={onDeleteAvatar}
          disabled={disabled}
          aria-label="Delete avatar"
          title="Delete avatar"
        >
          <Trash2 size={20} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="avatar-input"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

