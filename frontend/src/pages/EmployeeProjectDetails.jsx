import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../css/EmployeeProjectDetails.css";

const API_URL = "http://127.0.0.1:8000";

function EmployeeProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState(location.state?.project || null);
  const [loading, setLoading] = useState(!location.state?.project);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      if (location.state?.project) {
        setProject(location.state.project);
        setLoading(false);
        return;
      }

      if (!id) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/employee-login", { replace: true });
          return;
        }

        const response = await fetch(`${API_URL}/projects/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              `Failed to load project (${response.status}).`
          );
        }

        if (!cancelled) setProject(data);
      } catch (err) {
        console.error("Project details error:", err);
        if (!cancelled) {
          setError(err?.message || "Unable to load project details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id, location.state, navigate]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("complete")) return "completed";
    if (value.includes("progress") || value.includes("ongoing")) {
      return "in-progress";
    }
    if (value.includes("pending")) return "pending";
    return "default";
  };

  const goBack = () => navigate("/employee-projects");

  if (loading) {
    return (
      <main className="dashboard-main employee-project-details-page">
        <div className="project-details-loading">
          <div className="project-details-spinner" />
          <p>Loading project details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-main employee-project-details-page">
        <div className="project-details-error">
          <span className="project-details-eyebrow">PROJECT DETAILS</span>
          <h2>Unable to load project</h2>
          <p>{error}</p>
          <button type="button" className="project-details-action" onClick={goBack}>
            ← Back to My Projects
          </button>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="dashboard-main employee-project-details-page">
        <div className="project-details-empty">
          <span className="project-details-eyebrow">PROJECT DETAILS</span>
          <h2>Project not found</h2>
          <p>The requested project could not be found.</p>
          <button type="button" className="project-details-action" onClick={goBack}>
            ← Back to My Projects
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-main employee-project-details-page">
      <div className="project-details-topbar">
        <button
          type="button"
          className="project-details-action project-back-button"
          onClick={goBack}
        >
          ← Back to My Projects
        </button>
      </div>

      <section className="project-details-header">
        <div className="project-details-header-content">
          <span className="project-details-eyebrow">PROJECT DETAILS</span>
          <h1>{project.name || "Untitled Project"}</h1>
          <p>
            {project.description || "No project description available."}
          </p>
        </div>

        <span
          className={`project-details-status ${getStatusClass(project.status)}`}
        >
          {project.status || "Not specified"}
        </span>
      </section>

      <section className="project-details-card">
        <div className="project-details-card-header">
          <span className="project-details-eyebrow">PROJECT INFORMATION</span>
          <h2>Project Overview</h2>
        </div>

        <div className="project-overview">
          <div className="project-overview-grid">
            <div className="project-info-item">
              <span className="project-info-label">Project Name</span>
              <strong className="project-info-value">
                {project.name || "—"}
              </strong>
            </div>

            <div className="project-info-item">
              <span className="project-info-label">Status</span>
              <strong className="project-info-value">
                {project.status || "—"}
              </strong>
            </div>

            <div className="project-info-item">
              <span className="project-info-label">Start Date</span>
              <strong className="project-info-value">
                {formatDate(project.start_date)}
              </strong>
            </div>

            <div className="project-info-item">
              <span className="project-info-label">End Date</span>
              <strong className="project-info-value">
                {formatDate(project.end_date)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="project-details-card project-description-card">
        <div className="project-details-card-header">
          <span className="project-details-eyebrow">DESCRIPTION</span>
          <h2>About This Project</h2>
        </div>

        <div className="project-description-section">
          <p className="project-description">
            {project.description || "No project description has been provided."}
          </p>
        </div>
      </section>
    </main>
  );
}

export default EmployeeProjectDetails;
