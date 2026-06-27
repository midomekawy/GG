import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  confirmChangeEmail,
  extractApiErrorData,
  getApiErrorMessage,
  requestChangeEmail,
  updateMyProfile,
} from "../../services/api";

export default function ProfileForm({ profile, onProfileRefresh }) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const emailLocked = profile?.email || "";

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState("");

  const trimmedNewEmail = newEmail.trim();

  const canSubmitEmailStep1 = useMemo(() => trimmedNewEmail.length > 0, [trimmedNewEmail]);
  const profileUserId = useMemo(() => {
    const raw = profile?.id;
    if (raw == null || raw === "") return "";
    return String(raw).trim();
  }, [profile?.id]);

  const canSubmitEmailStep2 = useMemo(
    () => Boolean(profileUserId) && confirmCode.trim().length > 0,
    [profileUserId, confirmCode]
  );

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName || "");
    setSecondName(profile.secondName || "");
    setJobTitle(profile.jobTitle || "");
    setDateOfBirth((profile.dateOfBirth || "").slice(0, 10));
  }, [profile]);

  function closeEmailModal() {
    setEmailModalOpen(false);
    setEmailStep(1);
    setNewEmail("");
    setConfirmCode("");
    setEmailBusy(false);
    setEmailError("");
  }

  async function handleSaveChanges(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        firstName: firstName,
        secondName: secondName,
        jobTitle: jobTitle,
        dateOfBirth: (dateOfBirth || "").slice(0, 10),
      };

      await updateMyProfile(payload);

      if (typeof onProfileRefresh === "function") await onProfileRefresh();

      setSuccessMessage("Saved successfully.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(extractApiErrorData(err));
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStartChangeEmail() {
    const emailToSend = newEmail.trim();
    if (!emailToSend) {
      setEmailError("Please enter a new email address.");
      return;
    }

    setEmailBusy(true);
    setEmailError("");

    try {
      const payload = { newemail: emailToSend };
      await requestChangeEmail(payload);
      setEmailStep(2);
    } catch (err) {
      const extracted = extractApiErrorData(err);
      // eslint-disable-next-line no-console
      console.log("change-email error:", extracted, "status:", err?.response?.status);
      setEmailError(getApiErrorMessage(err));
    } finally {
      setEmailBusy(false);
    }
  }

  async function handleConfirmEmailChange() {
    const emailForConfirm = newEmail.trim();
    if (!emailForConfirm) {
      setEmailError("New email is missing. Close the dialog and try again.");
      return;
    }
    if (!profileUserId) {
      setEmailError("Your account user id is missing. Refresh the profile page and try again.");
      return;
    }

    setEmailBusy(true);
    setEmailError("");

    try {
      const payload = {
        id: String(profileUserId),
        newemail: emailForConfirm,
        code: confirmCode.trim(),
      };

      await confirmChangeEmail(payload);

      if (typeof onProfileRefresh === "function") await onProfileRefresh();

      setSuccessMessage("Email updated successfully.");
      closeEmailModal();
    } catch (err) {
      const extracted = extractApiErrorData(err);
      // eslint-disable-next-line no-console
      console.log("confirm-change-email error:", extracted, "status:", err?.response?.status);
      setEmailError(getApiErrorMessage(err));
    } finally {
      setEmailBusy(false);
    }
  }

  return (
    <section className="profile-form">
      <div className="profile-form-header">
        <h3 className="profile-form-title">User Settings</h3>
        <p className="profile-form-subtitle">Details</p>
      </div>

      {errorMessage ? (
        <div className="profile-alert profile-alert--error">{errorMessage}</div>
      ) : null}
      {successMessage ? (
        <div className="profile-alert profile-alert--success">{successMessage}</div>
      ) : null}

      <form className="profile-form-content" onSubmit={handleSaveChanges}>
        <div className="profile-name-grid">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-input"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <input
              type="email"
              className="form-input"
              value={emailLocked}
              disabled
              readOnly
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="avatar-change-btn"
              style={{ flex: "0 0 auto" }}
              onClick={() => setEmailModalOpen(true)}
            >
              Edit Email
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date of birth</label>
          <input
            type="date"
            className="form-input"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Job title</label>
          <input
            type="text"
            className="form-input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Software Engineer"
          />
        </div>

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      {emailModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-email-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEmailModal();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "white",
              borderRadius: "1.5rem",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-lg)",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
              <div>
                <h3
                  id="change-email-title"
                  style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)" }}
                >
                  Change Email
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {emailStep === 1
                    ? "Step 1: Enter your new email — we will send a verification code."
                    : `Step 2: Enter the code sent to ${trimmedNewEmail || "your new address"}`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEmailModal}
                className="avatar-delete-btn"
                aria-label="Close"
                style={{ width: 44, height: 44 }}
                disabled={emailBusy}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: "1.25rem", position: "relative", minHeight: emailStep === 2 ? 160 : 128 }}>
              {emailBusy ? (
                <div
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    background: "rgba(255,255,255,0.94)",
                    borderRadius: "1rem",
                    padding: "1rem",
                  }}
                >
                  <Loader2 className="profile-email-modal-spinner" size={32} aria-hidden />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--text-main)",
                      textAlign: "center",
                    }}
                  >
                    {emailStep === 1 ? "Sending verification code…" : "Confirming your new email…"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
                    {emailStep === 1 ? "Please wait." : "Almost done."}
                  </span>
                </div>
              ) : null}

              {emailError ? (
                <div className="profile-alert profile-alert--error" style={{ marginBottom: "1rem" }}>
                  {emailError}
                </div>
              ) : null}

              {emailStep === 1 ? (
                <>
                  <div className="form-group">
                    <label className="form-label">New email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@email.com"
                      disabled={emailBusy}
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="button"
                    className="save-btn"
                    disabled={emailBusy || !canSubmitEmailStep1}
                    style={{ marginTop: "1.25rem" }}
                    onClick={handleStartChangeEmail}
                  >
                    Send verification code
                  </button>
                </>
              ) : (
                <>
                  <p
                    style={{
                      margin: "0 0 1rem 0",
                      fontSize: "0.8125rem",
                      lineHeight: 1.5,
                      color: "var(--text-muted)",
                    }}
                  >
                    Enter the code from your email to finish. Requests use your Bearer token from the session.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Verification code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                      placeholder="Enter the code from your email"
                      disabled={emailBusy}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                    />
                  </div>

                  <button
                    type="button"
                    className="save-btn"
                    disabled={emailBusy || !canSubmitEmailStep2}
                    style={{ marginTop: "1.25rem" }}
                    onClick={handleConfirmEmailChange}
                  >
                    Confirm new email
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
