
import { 
  RefreshCw, 
  CheckCircle2, 
  Settings2, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Clock
} from "lucide-react";
import { useState } from "react";
import "./settings.css";

const UpdateSystemSettings = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState("v2.4.0");
  
  // Toggle states
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [updateNotifications, setUpdateNotifications] = useState(true);

  const checkForUpdates = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 2000);
  };

  const toggleVersion = (version) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  const releaseNotes = [
    {
      version: "v2.4.0",
      date: "October 20, 2023",
      improvements: [
        "Enhanced dashboard loading speed by 40% through lazy loading implementation.",
        "New dark mode palette for better contrast in low-light environments."
      ],
      bugFixes: [
        "Fixed a crash when exporting large CSV project files."
      ]
    },
    {
      version: "v2.3.5",
      date: "September 12, 2023",
      summary: "Minor performance patches and security updates."
    }
  ];

  return (
    <div className="settings-content-wrapper" style={{ maxWidth: "100%", padding: "0" }}>
      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            background: "#10B981",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 1000,
            animation: "slideIn 0.3s ease"
          }}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span style={{ fontWeight: 500 }}>System is already up to date</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "0.5rem",
            letterSpacing: "-0.025em"
          }}
        >
          System Update
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "#6B7280" }}>
          Manage your application version and update preferences.
        </p>
      </div>

      {/* System Status Card */}
      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "1rem",
          padding: "1.5rem 2rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {/* Icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}
          >
            <CheckCircle2 className="w-7 h-7" />
          </div>

          {/* Status Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#9CA3AF",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}
              >
                System Status
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: "600",
                  color: "#10B981",
                  background: "#D1FAE5",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.375rem",
                  letterSpacing: "0.025em"
                }}
              >
                UP TO DATE
              </span>
            </div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "0.25rem"
              }}
            >
              Current Version: v2.4.0
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>
              Your system is currently running the latest stable release.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#9CA3AF" }}>
              <Clock className="w-3.5 h-3.5" />
              <span>Last checked: October 24, 2023, 10:45 AM</span>
            </div>
          </div>
        </div>

        {/* Check for Updates Button */}
        <button
          onClick={checkForUpdates}
          disabled={isChecking}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.875rem 1.5rem",
            background: isChecking ? "#9CA3AF" : "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
            color: "white",
            border: "none",
            borderRadius: "0.75rem",
            fontSize: "0.9375rem",
            fontWeight: "600",
            cursor: isChecking ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            if (!isChecking) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChecking) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.25)";
            }
          }}
        >
          <RefreshCw
            className="w-4 h-4"
            style={{
              animation: isChecking ? "spin 1s linear infinite" : "none"
            }}
          />
          Check for Updates
        </button>
      </div>

      {/* Configuration Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Settings2 className="w-5 h-5" style={{ color: "#6366F1" }} />
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
            Configuration
          </h3>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "1rem",
            padding: "0.5rem 1.5rem"
          }}
        >
          {/* Auto-update Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem 0",
              borderBottom: "1px solid #F3F4F6"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#F3F4F6",
                  borderRadius: "0.625rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6B7280"
                }}
              >
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 style={{ fontSize: "0.9375rem", fontWeight: "600", color: "#111827", marginBottom: "0.125rem" }}>
                  Auto-update System
                </h4>
                <p style={{ fontSize: "0.8125rem", color: "#6B7280" }}>
                  Automatically download and install updates when available.
                </p>
              </div>
            </div>
            <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={() => setAutoUpdate(!autoUpdate)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              <div
                style={{
                  width: "48px",
                  height: "26px",
                  background: autoUpdate ? "#6366F1" : "#E5E7EB",
                  borderRadius: "13px",
                  position: "relative",
                  transition: "background 0.3s ease"
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    background: "white",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "3px",
                    left: autoUpdate ? "25px" : "3px",
                    transition: "left 0.3s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                />
              </div>
            </label>
          </div>

          {/* Update Notifications Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem 0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#F3F4F6",
                  borderRadius: "0.625rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6B7280"
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "0.9375rem", fontWeight: "600", color: "#111827", marginBottom: "0.125rem" }}>
                  Update Notifications
                </h4>
                <p style={{ fontSize: "0.8125rem", color: "#6B7280" }}>
                  Get notified about new features and major releases.
                </p>
              </div>
            </div>
            <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={updateNotifications}
                onChange={() => setUpdateNotifications(!updateNotifications)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              <div
                style={{
                  width: "48px",
                  height: "26px",
                  background: updateNotifications ? "#6366F1" : "#E5E7EB",
                  borderRadius: "13px",
                  position: "relative",
                  transition: "background 0.3s ease"
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    background: "white",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "3px",
                    left: updateNotifications ? "25px" : "3px",
                    transition: "left 0.3s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Release Notes Section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText className="w-5 h-5" style={{ color: "#6366F1" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
              Release Notes
            </h3>
          </div>
          <button
            style={{
              fontSize: "0.8125rem",
              fontWeight: "600",
              color: "#6366F1",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            View All History
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {releaseNotes.map((release) => (
            <div
              key={release.version}
              style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "0.875rem",
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => toggleVersion(release.version)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.25rem 1.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: "700",
                      color: "#111827"
                    }}
                  >
                    {release.version}
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>
                    {release.date}
                  </span>
                </div>
                {expandedVersion === release.version ? (
                  <ChevronDown className="w-5 h-5" style={{ color: "#9CA3AF" }} />
                ) : (
                  <ChevronRight className="w-5 h-5" style={{ color: "#9CA3AF" }} />
                )}
              </button>

              {expandedVersion === release.version && (
                <div
                  style={{
                    padding: "0 1.5rem 1.5rem",
                    borderTop: "1px solid #F3F4F6"
                  }}
                >
                  {release.improvements && (
                    <div style={{ marginTop: "1rem" }}>
                      <h5
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: "700",
                          color: "#6366F1",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "0.625rem"
                        }}
                      >
                        Improvements
                      </h5>
                      <ul
                        style={{
                          listStyle: "disc",
                          paddingLeft: "1.25rem",
                          margin: 0
                        }}
                      >
                        {release.improvements.map((item, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: "0.875rem",
                              color: "#4B5563",
                              marginBottom: "0.375rem",
                              lineHeight: "1.5"
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {release.bugFixes && (
                    <div style={{ marginTop: "1rem" }}>
                      <h5
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: "700",
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "0.625rem"
                        }}
                      >
                        Bug Fixes
                      </h5>
                      <ul
                        style={{
                          listStyle: "disc",
                          paddingLeft: "1.25rem",
                          margin: 0
                        }}
                      >
                        {release.bugFixes.map((item, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: "0.875rem",
                              color: "#4B5563",
                              marginBottom: "0.375rem",
                              lineHeight: "1.5"
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {release.summary && (
                    <p
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        lineHeight: "1.5"
                      }}
                    >
                      {release.summary}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UpdateSystemSettings;
