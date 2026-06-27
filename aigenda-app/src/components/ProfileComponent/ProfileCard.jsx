import AvatarUpload from "./AvatarUpload";

export default function ProfileCard({
  avatarUrl,
  username,
  email,
  uploadingAvatar,
  onUploadAvatar,
  onDeleteAvatar,
}) {
  return (
    <section className="profile-card">
      <div className="profile-card-inner">
        <div className="profile-avatar-wrapper">
          {/* Avatar is also shown inside AvatarUpload, but we keep this wrapper for layout parity */}
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            uploading={uploadingAvatar}
            onUploadAvatar={onUploadAvatar}
            onDeleteAvatar={onDeleteAvatar}
          />
        </div>

        <div className="profile-left-text">
          <h2 className="profile-username">{username ? `@${username}` : "@User-Name"}</h2>
          <p className="profile-email">{email || "user@email.com"}</p>
        </div>
      </div>
    </section>
  );
}

