import "../css/HRDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function HRDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || role !== "hr") {
      navigate("/hr-login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/dashboard/hr`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load dashboard."
          );
        }

        setDashboard(data);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.message || "Something went wrong while loading the dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  /* =========================
     LOADING
  ========================= */

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

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-error">
          <div className="error-icon">!</div>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

          <button
            type="button"
            className="secondary-error-btn"
            onClick={() => navigate("/hr-login")}
          >
            Return to Login
          </button>
        </div>
      </main>
    );
  }

  /* =========================
     SAFE VALUES
  ========================= */

  const totalEmployees = dashboard?.total_employees ?? 0;
  const totalReports = dashboard?.total_work_reports ?? 0;
  const pendingLeaves = dashboard?.pending_leave_requests ?? 0;
  const totalProjects = dashboard?.total_projects ?? 0;
  const ongoingProjects = dashboard?.ongoing_projects ?? 0;
  const completedProjects = dashboard?.completed_projects ?? 0;

  const completionPercentage =
    totalProjects > 0
      ? Math.min(
          100,
          Math.round((completedProjects / totalProjects) * 100)
        )
      : 0;

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";



  return (
    <main className="dashboard-main">

      {/* =========================
          DASHBOARD HEADER
      ========================= */}

      <div className="dashboard-heading">

        <div>
          <span className="page-eyebrow">
            OVERVIEW
          </span>

          <h1>
            {greeting}, HR
          </h1>

          <p>
            Here's what's happening across your organization.
          </p>
        </div>

        </div>


      {/* =========================
          KPI CARDS
      ========================= */}

      <section className="kpi-grid">

        {/* EMPLOYEES */}

        <button
          type="button"
          className="kpi-card dashboard-link-card"
          onClick={() => navigate("/employees")}
        >
          <div className="kpi-header">
            <span>Total Employees</span>

            <div className="kpi-icon">
              ♙
            </div>
          </div>

          <strong>
            {totalEmployees}
          </strong>

          <p>
            Active employees
          </p>
        </button>


        {/* WORK REPORTS */}

        <button
          type="button"
          className="kpi-card dashboard-link-card"
          onClick={() => navigate("/hr-work-reports")}
        >
          <div className="kpi-header">
            <span>Work Reports</span>

            <div className="kpi-icon">
              ▤
            </div>
          </div>

          <strong>
            {totalReports}
          </strong>

          <p>
            Reports submitted
          </p>
        </button>


        {/* LEAVE REQUESTS */}

        <button
          type="button"
          className="kpi-card dashboard-link-card"
          onClick={() => navigate("/hr-leaves")}
        >
          <div className="kpi-header">
            <span>Leave Requests</span>

            <div className="kpi-icon">
              ◷
            </div>
          </div>

          <strong>
            {pendingLeaves}
          </strong>

          <p>
            Awaiting approval
          </p>
        </button>


        {/* PROJECTS */}

        <button
          type="button"
          className="kpi-card dashboard-link-card"
          onClick={() => navigate("/hr-projects")}
        >
          <div className="kpi-header">
            <span>Total Projects</span>

            <div className="kpi-icon">
              □
            </div>
          </div>

          <strong>
            {totalProjects}
          </strong>

          <p>
            Organization projects
          </p>
        </button>

      </section>


      {/* =========================
          MAIN DASHBOARD PANELS
      ========================= */}

      <section className="dashboard-grid">

        {/* PROJECT OVERVIEW */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <span className="panel-eyebrow">
                PROJECTS
              </span>

              <h2>
                Project overview
              </h2>
            </div>

            <button
              type="button"
              className="panel-link-button"
              onClick={() => navigate("/hr-projects")}
            >
              View all →
            </button>

          </div>


          {/* PROJECT STATS */}

          <div className="project-stats">

            <div className="project-stat">

              <span className="stat-dot ongoing"></span>

              <div>
                <strong>
                  {ongoingProjects}
                </strong>

                <span>
                  Ongoing
                </span>
              </div>

            </div>


            <div className="project-stat">

              <span className="stat-dot completed"></span>

              <div>
                <strong>
                  {completedProjects}
                </strong>

                <span>
                  Completed
                </span>
              </div>

            </div>

          </div>


          {/* PROGRESS */}

          <div className="project-progress">

            <div className="progress-label">

              <span>
                Project completion
              </span>

              <strong>
                {completionPercentage}%
              </strong>

            </div>

            <div className="progress-track">

              <div
                className="progress-value"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* ATTENTION PANEL */}

        <div className="dashboard-panel attention-panel">

          <div className="panel-header">

            <div>
              <span className="panel-eyebrow">
                ATTENTION
              </span>

              <h2>
                Needs your attention
              </h2>
            </div>

          </div>


          {/* LEAVE */}

          <div
            className="attention-item"
            onClick={() => navigate("/hr-leaves")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/hr-leaves");
              }
            }}
          >

            <div className="attention-icon">
              ◷
            </div>

            <div>
              <strong>
                Leave requests
              </strong>

              <p>
                {pendingLeaves}{" "}
                request
                {pendingLeaves !== 1 ? "s" : ""}{" "}
                waiting for review.
              </p>
            </div>

            <span className="attention-arrow">
              →
            </span>

          </div>


          {/* REPORTS */}

          <div
            className="attention-item"
            onClick={() => navigate("/hr-work-reports")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/hr-work-reports");
              }
            }}
          >

            <div className="attention-icon">
              ▤
            </div>

            <div>
              <strong>
                Work reports
              </strong>

              <p>
                {totalReports}{" "}
                reports available for review.
              </p>
            </div>

            <span className="attention-arrow">
              →
            </span>

          </div>


          {/* EMPLOYEES */}

          <div
            className="attention-item"
            onClick={() => navigate("/employees")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/employees");
              }
            }}
          >

            <div className="attention-icon">
              ♙
            </div>

            <div>
              <strong>
                Employees
              </strong>

              <p>
                Manage your organization's employees.
              </p>
            </div>

            <span className="attention-arrow">
              →
            </span>

          </div>

        </div>

      </section>

{/* =========================
    HR ADMIN INFO + QUICK ACTIONS
========================= */}

      <section className="dashboard-lower-section">

        <div className="hr-admin-info hr-admin-info-aligned">
          <h1>HR Administrator</h1>
          <p>Human Resources • Mediatize • Hyderabad</p>
        </div>

        <div className="quick-actions">

        <div>
          <span className="panel-eyebrow">
            QUICK ACTIONS
          </span>

          <h2>
            Manage your organization
          </h2>
        </div>


        <div className="quick-action-buttons">

          <button
            type="button"
            onClick={() => navigate("/employees")}
          >
            <span>+</span>
            Add employee
          </button>


          <button
            type="button"
            onClick={() => navigate("/hr-projects")}
          >
            <span>□</span>
            Create project
          </button>


          <button
            type="button"
            onClick={() => navigate("/hr-leaves")}
          >
            <span>◷</span>
            Review leaves
          </button>


          <button
            type="button"
            onClick={() => navigate("/hr-work-reports")}
          >
            <span>▤</span>
            View reports
          </button>


          {/* PROFILE */}

        </div>
      </div>
      </section>

    </main>
  );
}

export default HRDashboard;