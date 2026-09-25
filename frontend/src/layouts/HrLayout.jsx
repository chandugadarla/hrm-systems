import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

function HRLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("role");

    navigate("/hr-login", { replace: true });
  };

  return (
    <div className="dashboard-page">

      {/* =========================
          SIDEBAR
      ========================== */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            H
          </div>

          <div>
            <strong>HRM</strong>
            <span>Human Resource Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <div className="nav-section-title">
            WORKSPACE
          </div>

          {/* Dashboard */}
          <button
            type="button"
            className={`nav-item ${
              isActive("/hr-dashboard") ? "active" : ""
            }`}
            onClick={() => navigate("/hr-dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          {/* Employees */}
          <button
            type="button"
            className={`nav-item ${
              isActive("/employees") ? "active" : ""
            }`}
            onClick={() => navigate("/employees")}
          >
            <span>♙</span>
            Employees
          </button>

          {/* Work Reports */}
          <button
            type="button"
            className={`nav-item ${
              isActive("/hr-work-reports") ? "active" : ""
            }`}
            onClick={() => navigate("/hr-work-reports")}
          >
            <span>▤</span>
            Work Reports
          </button>

          {/* Leaves */}
          <button
            type="button"
            className={`nav-item ${
              isActive("/hr-leaves") ? "active" : ""
            }`}
            onClick={() => navigate("/hr-leaves")}
          >
            <span>◷</span>
            Leave Management
          </button>

          {/* Projects */}
          <button
            type="button"
            className={`nav-item ${
              isActive("/hr-projects") ? "active" : ""
            }`}
            onClick={() => navigate("/hr-projects")}
          >
            <span>□</span>
            Projects
          </button>

          {/* Performance */}
          <button
            type="button"
            className={`nav-item ${
              isActive("/hr-performance") ? "active" : ""
            }`}
            onClick={() => navigate("/hr-performance")}
          >
            <span>↗</span>
            Performance
          </button>

          <div className="nav-section-title second">
            ORGANIZATION
          </div>

          {/* =========================
              HR NOTIFICATIONS
          ========================== */}
          <button
            type="button"
            className={`nav-item ${
              isActive("/hr-notifications") ? "active" : ""
            }`}
            onClick={() => {
              console.log(
                "HR Notifications clicked"
              );

              navigate("/hr-notifications");
            }}
          >
            <span>♢</span>
            Notifications
          </button>

        </nav>

        {/* =========================
            BOTTOM
        ========================== */}
        <div className="sidebar-bottom">

          <button
            type="button"
            className="nav-item"
            onClick={() => navigate("/hr-settings")}
          >
            <span>⚙</span>
            Settings
          </button>

          <button
            type="button"
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Sign out
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <div className="dashboard-content">

        <header className="dashboard-topbar">

          <div className="mobile-brand">
            <div className="sidebar-logo">
              H
            </div>

            <strong>HRM</strong>
          </div>

          <div className="dashboard-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search employees, reports..."
            />
          </div>

          <div className="topbar-actions">

            {/* HR notification bell */}
            <button
              type="button"
              className={`notification-button ${
                isActive("/hr-notifications")
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                console.log(
                  "HR notification bell clicked"
                );

                navigate("/hr-notifications");
              }}
              aria-label="HR Notifications"
            >
              ♧
            </button>

            {/* Profile */}
            <button
              type="button"
              className="profile"
              onClick={() =>
                navigate("/hr-profile")
              }
            >
              <div className="profile-avatar">
                HR
              </div>

              <div className="profile-info">
                <strong>
                  HR Administrator
                </strong>

                <span>
                  Human Resources
                </span>
              </div>

              <span className="profile-arrow">
                ˅
              </span>
            </button>

          </div>

        </header>

        {/* Page */}
        <Outlet />

      </div>

    </div>
  );
}

export default HRLayout;