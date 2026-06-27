import { Shield, Lock, ShieldCheck, Monitor, Smartphone, Laptop, HelpCircle } from "lucide-react";
import { useState } from "react";
import "./settings.css";

const SecuritySettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const sessions = [
    {
      id: 1,
      device: "MacBook Pro 16\"",
      type: "laptop",
      status: "Current Device",
      location: "Chrome • San Francisco, USA • 192.168.1.1",
      isCurrent: true
    },
    {
      id: 2,
      device: "iPhone 15 Pro",
      type: "mobile",
      status: "Connected",
      location: "iOS App • New York, USA • 172.16.254.1",
      isCurrent: false
    },
    {
      id: 3,
      device: "Windows Workstation",
      type: "desktop",
      status: "Connected",
      location: "Firefox • London, UK • 10.0.0.45",
      isCurrent: false
    }
  ];

  const handleLogoutAllSessions = () => {
    alert("All other sessions have been logged out.");
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "laptop":
        return <Laptop className="w-5 h-5 text-gray-500" />;
      case "mobile":
        return <Smartphone className="w-5 h-5 text-gray-500" />;
      case "desktop":
        return <Monitor className="w-5 h-5 text-gray-500" />;
      default:
        return <Laptop className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="settings-content-wrapper">
      {/* Header */}
      <div className="settings-page-header">
        <h2 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
          Security Settings
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Manage your password, account verification, and active sessions.
        </p>
      </div>

      {/* Password Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Lock className="w-4 h-4 text-purple-600" />
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>Password</h3>
        </div>
        
        <div 
          style={{ 
            background: "white", 
            border: "1px solid #e5e7eb", 
            borderRadius: "0.75rem",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem"
          }}
        >
          <div>
            <p style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>Update your password</p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              Last changed 3 months ago. We recommend a unique, long password.
            </p>
          </div>
          <button 
            onClick={() => setShowPasswordModal(true)}
            style={{ 
              padding: "0.5rem 1.25rem", 
              background: "linear-gradient(135deg, #7c3aed, #a855f7)", 
              color: "white", 
              border: "none", 
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 4px rgba(124, 58, 237, 0.3)"
            }}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>Two-Factor Authentication</h3>
        </div>
        
        <div 
          style={{ 
            background: "white", 
            border: "1px solid #e5e7eb", 
            borderRadius: "0.75rem",
            padding: "1.25rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>Secure your account with 2FA</p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "1rem", lineHeight: "1.5" }}>
                Two-factor authentication adds an extra layer of security to your account. In addition to your password, you'll need to enter a code from an authenticator app.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  style={{ 
                    fontSize: "0.75rem", 
                    color: "#7c3aed", 
                    fontWeight: "600",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Download Backup Codes
                </button>
                <button 
                  style={{ 
                    fontSize: "0.75rem", 
                    color: "#7c3aed", 
                    fontWeight: "600",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Change Method
                </button>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <div 
              onClick={() => setIs2FAEnabled(!is2FAEnabled)}
              style={{ 
                width: "44px", 
                height: "24px", 
                background: is2FAEnabled ? "#7c3aed" : "#e5e7eb",
                borderRadius: "12px",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
            >
              <div 
                style={{ 
                  width: "18px", 
                  height: "18px", 
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "3px",
                  left: is2FAEnabled ? "23px" : "3px",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Monitor className="w-4 h-4 text-purple-600" />
            <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>Active Sessions</h3>
          </div>
          <button 
            onClick={handleLogoutAllSessions}
            style={{ 
              fontSize: "0.75rem", 
              color: "#dc2626", 
              fontWeight: "600",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.375rem",
              padding: "0.375rem 0.75rem",
              cursor: "pointer"
            }}
          >
            Log out of all sessions
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sessions.map((session) => (
            <div 
              key={session.id}
              style={{ 
                background: "white", 
                border: "1px solid #e5e7eb", 
                borderRadius: "0.75rem",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div 
                  style={{ 
                    width: "40px", 
                    height: "40px", 
                    background: "#f3f4f6", 
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {getDeviceIcon(session.type)}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "600", color: "#111827", fontSize: "0.875rem" }}>{session.device}</span>
                    {session.isCurrent && (
                      <span 
                        style={{ 
                          fontSize: "0.625rem", 
                          color: "#16a34a", 
                          background: "#dcfce7",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "0.25rem",
                          fontWeight: "600"
                        }}
                      >
                        CURRENT DEVICE
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{session.location}</p>
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: "500" }}>{session.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Alert */}
      <div 
        style={{ 
          background: "#f9fafb", 
          border: "1px solid #e5e7eb", 
          borderRadius: "0.75rem",
          padding: "1rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start"
        }}
      >
        <div 
          style={{ 
            width: "32px", 
            height: "32px", 
            background: "#ede9fe", 
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <HelpCircle className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p style={{ fontWeight: "600", color: "#111827", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Not recognizing a session?
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: "1.5" }}>
            If you see a device or location that you don't recognize, we recommend changing your password immediately and revoking all active sessions to secure your account.
          </p>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div 
          style={{ 
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div 
            style={{ 
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              width: "400px",
              maxWidth: "90%"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.5rem" }}>Change Password</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <input 
                type="password" 
                placeholder="Current password"
                style={{ 
                  padding: "0.75rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem"
                }}
              />
              <input 
                type="password" 
                placeholder="New password"
                style={{ 
                  padding: "0.75rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem"
                }}
              />
              <input 
                type="password" 
                placeholder="Confirm new password"
                style={{ 
                  padding: "0.75rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowPasswordModal(false)}
                style={{ 
                  padding: "0.625rem 1.25rem",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  alert("Password updated successfully!");
                }}
                style={{ 
                  padding: "0.625rem 1.25rem",
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
