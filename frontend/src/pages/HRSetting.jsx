import "../css/HRSetting.css";
import { useState } from "react";

function HRSetting() {
  const [emailNotifications, setEmailNotifications] = useState(
    () => localStorage.getItem("hr_email_notifications") !== "false"
  );
  const [compactTables, setCompactTables] = useState(
    () => localStorage.getItem("hr_compact_tables") === "true"
  );
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    localStorage.setItem("hr_email_notifications", String(emailNotifications));
    localStorage.setItem("hr_compact_tables", String(compactTables));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <main className="dashboard-main">
      <section className="hr-content settings-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">SYSTEM</span>
            <h1>Settings</h1>
            <p>Manage preferences for the HR workspace.</p>
          </div>
        </div>

        <div className="settings-grid">
          <section className="settings-card">
            <div className="settings-card-header">
              <span className="eyebrow">PREFERENCES</span>
              <h2>Workspace preferences</h2>
              <p>These settings are stored locally for this browser.</p>
            </div>

            <label className="setting-row">
              <span>
                <strong>Email notifications</strong>
                <small>Enable notification preference for this workspace.</small>
              </span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            </label>

            <label className="setting-row">
              <span>
                <strong>Compact tables</strong>
                <small>Use a denser presentation when reviewing records.</small>
              </span>
              <input
                type="checkbox"
                checked={compactTables}
                onChange={(e) => setCompactTables(e.target.checked)}
              />
            </label>

            <button type="button" className="save-button settings-save" onClick={saveSettings}>
              Save settings
            </button>

            {saved && <div className="settings-saved">Settings saved successfully.</div>}
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <span className="eyebrow">ACCOUNT</span>
              <h2>HR administrator</h2>
              <p>Current portal access and security information.</p>
            </div>

            <div className="settings-info-row">
              <span>Role</span>
              <strong>HR Administrator</strong>
            </div>
            <div className="settings-info-row">
              <span>Authentication</span>
              <strong>Email OTP + JWT</strong>
            </div>
            <div className="settings-info-row">
              <span>Access level</span>
              <strong>HR / Full workspace</strong>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default HRSetting;
