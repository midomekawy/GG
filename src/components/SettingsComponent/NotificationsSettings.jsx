import { Smartphone, Mail, Monitor } from "lucide-react";
import { useState } from "react";
import "./settings.css";

const NotificationsSettings = () => {
  const [settings, setSettings] = useState({
    push: true,
    email: true,
    desktop: false,
    frequency: "Daily",
    quietStart: "01:00 pm",
    quietEnd: "09:00 am"
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="settings-content-wrapper">
      <div className="settings-page-header">
        <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
          Notifications Settings
        </h2>
        <p style={{ color: "var(--text-muted)" }}>
          Manage how and when you receive alerts from our app
        </p>
      </div>

      {/* Push Notifications */}
      <div className="toggle-group">
        <div className="toggle-info">
          <div className="toggle-icon">
            <Smartphone style={{ width: "2rem", height: "2rem" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Push Notifications</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Receive all new alerts via mobile notifications
            </p>
          </div>
        </div>
        <div 
          className={`toggle-switch ${settings.push ? 'active' : ''}`}
          onClick={() => toggleSetting('push')}
        />
      </div>

      {/* Email Notifications */}
      <div className="toggle-group">
        <div className="toggle-info">
          <div className="toggle-icon">
            <Mail style={{ width: "2rem", height: "2rem" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Email Notifications</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Get instant alerts on your email address
            </p>
          </div>
        </div>
        <div 
          className={`toggle-switch ${settings.email ? 'active' : ''}`}
          onClick={() => toggleSetting('email')}
        />
      </div>

      {/* Desktop Alerts */}
      <div className="toggle-group">
        <div className="toggle-info">
          <div className="toggle-icon">
            <Monitor style={{ width: "2rem", height: "2rem" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Desktop Alerts</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Show notification popups on your workstation
            </p>
          </div>
        </div>
        <div 
          className={`toggle-switch ${settings.desktop ? 'active' : ''}`}
          onClick={() => toggleSetting('desktop')}
        />
      </div>

      {/* Delivery Schedule Card */}
      <div className="settings-card" style={{ marginTop: "3rem", borderRadius: "3rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "2.5rem" }}>
          Delivery Schedule
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
          <div className="form-group">
            <label className="form-label">Notification Frequency</label>
            <select 
              className="form-input" 
              value={settings.frequency}
              onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
              style={{
                appearance: "none", 
                backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')", 
                backgroundRepeat: "no-repeat", 
                backgroundPosition: "right 1.5rem center", 
                backgroundSize: "1rem"
              }}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Real-time</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quiet Time</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input 
                type="text" 
                className="form-input" 
                value={settings.quietStart} 
                style={{ flex: 1 }}
                onChange={(e) => setSettings(prev => ({ ...prev, quietStart: e.target.value }))}
              />
              <span style={{ fontWeight: "700", color: "var(--text-soft)" }}>To</span>
              <input 
                type="text" 
                className="form-input" 
                value={settings.quietEnd} 
                style={{ flex: 1 }}
                onChange={(e) => setSettings(prev => ({ ...prev, quietEnd: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)" }}>
          <button style={{ padding: "1rem 2.5rem", background: "var(--bg-main)", color: "var(--text-muted)", border: "none", borderRadius: "1.25rem", fontWeight: "700", cursor: "pointer" }}>
            Cancel
          </button>
          <button style={{ padding: "1rem 2.5rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "1.25rem", fontWeight: "700", cursor: "pointer", boxShadow: "var(--shadow-primary)" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
