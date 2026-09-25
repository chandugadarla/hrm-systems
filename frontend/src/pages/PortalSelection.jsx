import "../css/PortalSelection.css";
import { useNavigate } from "react-router-dom";

function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="portal-page">
      <div className="portal-container">

        {/* Brand */}
        <header className="portal-header">
          <div className="brand">
            <div className="brand-mark">H</div>
            <div>
              <div className="brand-name">HRM</div>
              <div className="brand-subtitle">
                Human Resource Management
              </div>
            </div>
          </div>

          <div className="header-links">
            <span>People</span>
            <span>Process</span>
            <span>Progress</span>
          </div>
        </header>

        {/* Main */}
        <main className="portal-main">

          <section className="portal-intro">
            <div className="eyebrow">HRM WORKSPACE</div>

            <h1>
              People at the center.
              <br />
              Performance in focus.
            </h1>

            <p>
              A secure workspace for managing people, work,
              projects, performance and employee operations.
            </p>

            <div className="trust-row">
              <span>Secure access</span>
              <span>•</span>
              <span>Role-based workspace</span>
              <span>•</span>
              <span>OTP authentication</span>
            </div>
          </section>

          {/* Portal Cards */}
          <section className="portal-selection">

            <div className="selection-heading">
              <span>ACCESS YOUR WORKSPACE</span>
              <h2>Choose your portal</h2>
              <p>
                Select the workspace assigned to your role.
              </p>
            </div>

            <div className="portal-cards">

              {/* HR */}
              <button
                className="portal-card"
                onClick={() => navigate("/hr-login")}
              >
                <div className="card-top">
                  <div className="portal-icon">HR</div>
                  <span className="arrow">↗</span>
                </div>

                <div className="card-content">
                  <span className="card-label">ADMINISTRATION</span>

                  <h3>HR Portal</h3>

                  <p>
                    Manage employees, work reports, leave requests,
                    projects, performance and notifications.
                  </p>
                </div>

                <div className="card-footer">
                  <span>Continue as HR</span>
                  <span>→</span>
                </div>
              </button>

              {/* Employee */}
              <button
                className="portal-card"
                onClick={() => navigate("/employee-login")}
              >
                <div className="card-top">
                  <div className="portal-icon employee-icon">EM</div>
                  <span className="arrow">↗</span>
                </div>

                <div className="card-content">
                  <span className="card-label">EMPLOYEE WORKSPACE</span>

                  <h3>Employee Portal</h3>

                  <p>
                    View your work reports, projects, leave status,
                    notifications and performance.
                  </p>
                </div>

                <div className="card-footer">
                  <span>Continue as Employee</span>
                  <span>→</span>
                </div>
              </button>

            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="portal-footer">
          <span>© 2026 HRM. All rights reserved.</span>

          <div>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Help</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default PortalSelection;