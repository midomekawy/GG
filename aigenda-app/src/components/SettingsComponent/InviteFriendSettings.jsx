import { useState } from "react";
import { 
  Send, 
  Copy, 
  Check, 
  Mail,
  Users,
  ArrowRight
} from "lucide-react";
import "./settings.css";

const InviteFriendSettings = () => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([
    { email: "sarah.design@example.com", sentOn: "Oct 18, 2023" },
    { email: "mike.dev@example.com", sentOn: "Oct 15, 2023" }
  ]);

  const inviteLink = "https://aigenda.app/join/team-xyz";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (email) {
      const newInvite = {
        email: email,
        sentOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setPendingInvites([newInvite, ...pendingInvites]);
      setEmail("");
    }
  };

  const handleResend = (inviteEmail) => {
    // Simulate resend
    alert(`Invite resent to ${inviteEmail}`);
  };

  return (
    <div className="settings-content-wrapper" style={{ maxWidth: "100%" }}>
      {/* Header with Illustration */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        {/* Purple Illustration */}
        <div
          style={{
            width: "120px",
            height: "120px",
            margin: "0 auto 1.5rem",
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            borderRadius: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.25)"
          }}
        >
          <Users className="w-14 h-14" style={{ color: "white" }} />
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "0.5rem",
            letterSpacing: "-0.025em"
          }}
        >
          Invite your team
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "#6B7280" }}>
          Collaborate better by inviting your team members to AiGenda
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Invite by Email Card */}
        <div
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "1rem",
            padding: "1.5rem"
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Mail className="w-5 h-5" style={{ color: "#6366F1" }} />
            Invite by Email
          </h3>
          <form onSubmit={handleSendInvite} style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "0.875rem 1rem",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                fontSize: "0.9375rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#6366F1"}
              onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
            />
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 1.5rem",
                background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "0.9375rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.25)";
              }}
            >
              <Send className="w-4 h-4" />
              Send Invite
            </button>
          </form>
        </div>

        {/* Share Invite Link Card */}
        <div
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "1rem",
            padding: "1.5rem"
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "1.25rem"
            }}
          >
            Share Invite Link
          </h3>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <input
              type="text"
              value={inviteLink}
              readOnly
              style={{
                flex: 1,
                padding: "0.875rem 1rem",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                fontSize: "0.9375rem",
                background: "#F9FAFB",
                color: "#6B7280"
              }}
            />
            <button
              onClick={copyToClipboard}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 1.25rem",
                background: copied ? "#10B981" : "white",
                color: copied ? "white" : "#374151",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                fontSize: "0.9375rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.target.style.background = "#F9FAFB";
                  e.target.style.borderColor = "#D1D5DB";
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.target.style.background = "white";
                  e.target.style.borderColor = "#E5E7EB";
                }
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>
            Anyone with this link can join your team
          </p>
        </div>

        {/* Pending Invites Table */}
        {pendingInvites.length > 0 && (
          <div
            style={{
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "1rem",
              padding: "1.5rem",
              overflow: "hidden"
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "1.25rem"
              }}
            >
              Pending Invites
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 0",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Email Address
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 1rem",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Sent On
                    </th>
                    <th style={{ width: "100px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvites.map((invite, index) => (
                    <tr key={index} style={{ borderBottom: index < pendingInvites.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <td style={{ padding: "1rem 0", fontSize: "0.9375rem", color: "#111827" }}>
                        {invite.email}
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6B7280" }}>
                        {invite.sentOn}
                      </td>
                      <td style={{ padding: "1rem 0", textAlign: "right" }}>
                        <button
                          onClick={() => handleResend(invite.email)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#6366F1",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.target.style.color = "#4F46E5"}
                          onMouseLeave={(e) => e.target.style.color = "#6366F1"}
                        >
                          Resend
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteFriendSettings;
