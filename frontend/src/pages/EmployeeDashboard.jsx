import "../css/EmployeeDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || role !== "employee") {
      navigate("/employee-login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/dashboard/employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      let data = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("The server returned an invalid response.");
        }
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load employee dashboard.");
      }

      setDashboard(data);
    } catch (err) {
      setError(err.message || "Unable to load employee dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("role");
    navigate("/");
  };

  if (loading) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your workspace...</p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-error">
          <h2>Unable to load dashboard</h2>
          <p>{error || "No dashboard data is available."}</p>
          <button type="button" onClick={fetchDashboard}>
            Try Again
          </button>
          <button type="button" onClick={logout}>
            Return to Portal
          </button>
        </div>
      </main>
    );
  }

  const projectCompletion =
    dashboard.assigned_projects > 0
      ? Math.round(
          (dashboard.completed_projects / dashboard.assigned_projects) * 100
        )
      : 0;

  return (
    <main className="dashboard-main">
      {/* ================= PAGE HEADING ================= */}
      <div className="dashboard-heading">
        <div>
          <span className="page-eyebrow">OVERVIEW</span>
          <h1>Welcome back</h1>
          <p>Here's an overview of your work and activity.</p>
        </div>

        <button
          className="date-button"
          type="button"
          onClick={() => navigate("/employee-leaves")}
        >
          Leave Management
          <span>→</span>
        </button>
      </div>

      {/* ================= KPI CARDS ================= */}
   <section className="kpi-grid">

  <button
    type="button"
    className="kpi-card dashboard-link-card"
    onClick={() => navigate("/employee-work-reports")}
  >
    <div className="kpi-header">
      <span>Work Reports</span>
      <div className="kpi-icon">▤</div>
    </div>

    <strong>{dashboard.total_work_reports}</strong>

    <p>Your submitted reports</p>
  </button>


  <button
    type="button"
    className="kpi-card dashboard-link-card"
    onClick={() => navigate("/employee-leaves")}
  >
    <div className="kpi-header">
      <span>Pending Leaves</span>
      <div className="kpi-icon">◷</div>
    </div>

    <strong>{dashboard.pending_leave_requests}</strong>

    <p>Awaiting HR approval</p>
  </button>


  <button
    type="button"
    className="kpi-card dashboard-link-card"
    onClick={() => navigate("/employee-leaves")}
  >
    <div className="kpi-header">
      <span>Approved Leaves</span>
      <div className="kpi-icon">✓</div>
    </div>

    <strong>{dashboard.approved_leave_requests}</strong>

    <p>Approved requests</p>
  </button>


  <button
    type="button"
    className="kpi-card dashboard-link-card"
    onClick={() => navigate("/employee-projects")}
  >
    <div className="kpi-header">
      <span>Assigned Projects</span>
      <div className="kpi-icon">□</div>
    </div>

    <strong>{dashboard.assigned_projects}</strong>

    <p>Your assigned projects</p>
  </button>

      </section>

      {/* ================= LOWER DASHBOARD ================= */}
      <section className="dashboard-grid">
        {/* PROJECT ACTIVITY */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">PROJECTS</span>
              <h2>Your project activity</h2>
            </div>

            <button
              className="panel-link"
              type="button"
              onClick={() => navigate("/employee-projects")}
            >
              View projects →
            </button>
          </div>

          <div className="project-stats">
            <button
              type="button"
              className="project-stat dashboard-project-link"
              onClick={() => navigate("/employee-projects")}
              aria-label="View ongoing projects"
            >
              <span className="stat-dot ongoing"></span>
              <div>
                <strong>{dashboard.ongoing_projects}</strong>
                <span>Ongoing</span>
              </div>
            </button>

            <button
              type="button"
              className="project-stat dashboard-project-link"
              onClick={() => navigate("/employee-projects")}
              aria-label="View completed projects"
            >
              <span className="stat-dot completed"></span>
              <div>
                <strong>{dashboard.completed_projects}</strong>
                <span>Completed</span>
              </div>
            </button>
          </div>

          <div className="project-progress">
            <div className="progress-label">
              <span>Project completion</span>
              <strong>{projectCompletion}%</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-value"
                style={{ width: `${projectCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="dashboard-panel attention-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">QUICK ACCESS</span>
              <h2>Manage your work</h2>
            </div>
          </div>

          <button
            className="attention-item"
            type="button"
            onClick={() => navigate("/employee-work-reports")}
          >
            <div className="attention-icon">▤</div>
            <div>
              <strong>Work Reports</strong>
              <p>Submit and review your work reports.</p>
            </div>
            <span>→</span>
          </button>

          <button
            className="attention-item"
            type="button"
            onClick={() => navigate("/employee-leaves")}
          >
            <div className="attention-icon">◷</div>
            <div>
              <strong>Leave Management</strong>
              <p>Apply for leave and check request status.</p>
            </div>
            <span>→</span>
          </button>

          <button
            className="attention-item"
            type="button"
            onClick={() => navigate("/employee-notifications")}
          >
            <div className="attention-icon">◇</div>
            <div>
              <strong>Notifications</strong>
              <p>View announcements and updates published by HR.</p>
            </div>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* ================= QUICK ACTIONS ================= */}
      <section className="quick-actions">
        <div>
          <span className="panel-eyebrow">QUICK ACTIONS</span>
          <h2>Continue your work</h2>
        </div>

        <div className="quick-action-buttons">
          <button
            type="button"
            onClick={() => navigate("/employee-work-reports")}
          >
            <span>+</span>
            Submit work report
          </button>

          <button
            type="button"
            onClick={() => navigate("/employee-leaves")}
          >
            <span>◷</span>
            Apply for leave
          </button>

          <button
            type="button"
            onClick={() => navigate("/employee-notifications")}
          >
            <span>◇</span>
            View notifications
          </button>
        </div>
      </section>
    </main>
  );
}

export default EmployeeDashboard;
