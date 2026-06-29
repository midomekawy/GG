import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Sidebar from "../HomeComponent/Sidebar";
import Header from "../HomeComponent/Header";
import "../HomeComponent/home.css";
import AvatarUpload from "./AvatarUpload";
import ProfileForm from "./ProfileForm";
import "./profile.css";
import {
  deleteMyAvatar,
  extractApiErrorData,
  getApiErrorMessage,
  getMyAvatar,
  getMyProfile,
  uploadMyAvatar,
} from "../../services/api";

function normalizeProfile(apiPayload) {
  const data = apiPayload?.data ?? apiPayload;
  const root = data?.data ?? data?.profile ?? data;
  const firstName = root?.firstName ?? "";
  const secondName = root?.secondName ?? root?.lastName ?? "";
  const email = root?.email ?? "";
  const jobTitle = root?.jobTitle ?? "";
  const rawDob = root?.dateOfBirth ?? "";
  const dateOfBirth = typeof rawDob === "string" ? rawDob.slice(0, 10) : "";

  const idRaw =
    root?.id ??
    root?.Id ??
    root?.userId ??
    root?.UserId ??
    root?.userID ??
    data?.id ??
    data?.userId ??
    apiPayload?.id;
  const id = idRaw != null && String(idRaw).trim() !== "" ? String(idRaw).trim() : "";

  return { firstName, secondName, email, jobTitle, dateOfBirth, id };
}

export default function Profile() {
  const navigate = useNavigate();
  const { setUser, clearUser } = useUser();

  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const username = useMemo(() => {
    if (!profile) return "User-Name";
    const full = `${profile.firstName || ""} ${profile.secondName || ""}`.trim();
    return full ? full.replace(/\s+/g, " ") : "User-Name";
  }, [profile]);

  async function refreshProfile() {
    const res = await getMyProfile();
    setProfile(normalizeProfile(res?.data));
  }

  useEffect(() => {
    if (!profile) return;
    const full = `${profile.firstName ?? ""} ${profile.secondName ?? ""}`.trim();
    const displayName = full || profile.email || "User";
    setUser(displayName, avatarUrl);
  }, [profile, avatarUrl, setUser]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setPageLoading(true);
      setErrorMessage("");
      try {
        const [profileRes] = await Promise.all([getMyProfile()]);

        if (!isMounted) return;
        setProfile(normalizeProfile(profileRes?.data));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(extractApiErrorData(err));
        setErrorMessage(getApiErrorMessage(err));
        if (err?.response?.status === 401) {
          clearUser();
          navigate("/login");
        }
      } finally {
        if (isMounted) setPageLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAvatar() {
      try {
        const res = await getMyAvatar();
        if (cancelled) return;

        const path = res?.data?.avatarUrl;
        if (!path) {
          setAvatarUrl(null);
          return;
        }

        const fullUrl = `https://aigendaweb.runasp.net${path.startsWith("/") ? "" : "/"}${path}`;
        setAvatarUrl(fullUrl);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(extractApiErrorData(err));

        if (err?.response?.status === 401) {
          clearUser();
          navigate("/login");
          return;
        }

        setAvatarUrl(null);
      }
    }

    fetchAvatar();

    return () => {
      cancelled = true;
    };
    // Re-run when we explicitly refresh by changing this key (see handlers below)
  }, [navigate, avatarUploading, clearUser]);

  async function handleUploadAvatar(file) {
    setAvatarUploading(true);
    try {
      // eslint-disable-next-line no-console
      console.log("Uploading avatar:", { name: file?.name, size: file?.size, type: file?.type });
      await uploadMyAvatar(file);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(extractApiErrorData(err));
      if (err?.response?.status === 401) {
        clearUser();
        navigate("/login");
      }
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleDeleteAvatar() {
    setAvatarUploading(true);
    try {
      await deleteMyAvatar();
      setAvatarUrl(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(extractApiErrorData(err));
      if (err?.response?.status === 401) {
        clearUser();
        navigate("/login");
      }
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ marginLeft: "120px" }}>
        <Header />

        <div className="page-container">
          {pageLoading ? (
            <div className="profile-loading">Loading your profile...</div>
          ) : errorMessage ? (
            <div className="profile-alert profile-alert--error">{errorMessage}</div>
          ) : profile ? (
            <div className="profile-layout">
              <div>
                <section className="profile-card">
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl}
                    uploading={avatarUploading}
                    onUploadAvatar={handleUploadAvatar}
                    onDeleteAvatar={handleDeleteAvatar}
                  />

                  <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
                    <h2 className="profile-username">{`@${username}`}</h2>
                    <p className="profile-email">{profile.email}</p>
                  </div>
                </section>

                <section
                  className="profile-card"
                  style={{ marginTop: "1.5rem", textAlign: "left", padding: "2.5rem" }}
                >
                  <div style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "1.25rem", marginBottom: "1.5rem" }}>
                    Information
                  </div>

                  <div style={{ display: "grid", gap: "1.25rem" }}>
                    <div>
                      <div style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Name
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {profile.firstName} {profile.secondName}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Email
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {profile.email}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Date of birth
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {profile.dateOfBirth}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Job title
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {profile.jobTitle}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <ProfileForm profile={profile} onProfileRefresh={refreshProfile} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

