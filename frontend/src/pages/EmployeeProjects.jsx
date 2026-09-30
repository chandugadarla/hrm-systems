import "../css/EmployeeProjects.css";
import Pagination from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function EmployeeProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedProjects,
  } = usePagination(projects, 8);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/employee-login");
        return;
      }

      const response = await fetch(`${API_URL}/projects/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to load projects."
        );
      }

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Projects error:", err);

      setError(
        err?.message || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openProject = (project) => {
    if (!project?.id) {
      console.error("Project ID is missing:", project);
      return;
    }

    navigate(`/employee-projects/${project.id}`, {
      state: {
        project,
      },
    });
  };

  const getStatusClass = (status) => {
    const value = (status || "").toLowerCase();

    if (value.includes("complete")) {
      return "completed";
    }

    if (
      value.includes("progress") ||
      value.includes("ongoing")
    ) {
      return "in-progress";
    }

    if (value.includes("pending")) {
      return "pending";
    }

    return "default";
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="dashboard-main employee-projects-page">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            WORKSPACE
          </span>

          <h1>
            My Projects
          </h1>

          <p>
            View projects assigned to you and track their status.
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchProjects}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="dashboard-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      {/* PROJECT SECTION */}
      <section className="projects-section">

        {/* SECTION HEADER */}
        <div className="projects-section-header">

          <div>
            <span className="eyebrow">
              PROJECT PORTFOLIO
            </span>

            <h2>
              Assigned Projects
            </h2>

            <p>
              Click any project to view the complete description.
            </p>
          </div>

          <div className="projects-total">
            {projects.length}{" "}
            {projects.length === 1
              ? "project"
              : "projects"}
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="projects-message">
            <div className="projects-spinner" />

            <span>
              Loading projects...
            </span>
          </div>
        ) : projects.length === 0 ? (

          /* EMPTY */
          <div className="projects-message projects-empty">

            <div className="projects-empty-icon">
              □
            </div>

            <strong>
              No projects assigned
            </strong>

            <span>
              Projects assigned by HR will appear here.
            </span>

          </div>

        ) : (

          /* PROJECTS */
          <>
            <div className="projects-grid">

              {paginatedProjects.map((project) => (

                <article
                  key={project.id}
                  className="project-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openProject(project)}
                  onKeyDown={(event) => {

                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      openProject(project);
                    }

                  }}
                >

                  {/* CARD HEADER */}
                  <div className="project-card-header">

                    <div className="project-card-icon">
                      □
                    </div>

                    <span
                      className={`project-status ${getStatusClass(
                        project.status
                      )}`}
                    >
                      {project.status || "Not specified"}
                    </span>

                  </div>

                  {/* PROJECT NAME */}
                  <h3>
                    {project.name || "Untitled Project"}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="project-card-description">
                    {project.description ||
                      "No project description available."}
                  </p>

                  {/* DATES */}
                  <div className="project-card-meta">

                    <div>
                      <span>
                        START DATE
                      </span>

                      <strong>
                        {formatDate(project.start_date)}
                      </strong>
                    </div>

                    <div>
                      <span>
                        END DATE
                      </span>

                      <strong>
                        {formatDate(project.end_date)}
                      </strong>
                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="project-card-footer">

                    <span>
                      View project details
                    </span>

                    <strong>
                      →
                    </strong>

                  </div>

                </article>

              ))}

            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="projects-pagination">

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  totalItems={projects.length}
                  itemsPerPage={8}
                />

              </div>
            )}

          </>
        )}

      </section>
    </main>
  );
}

export default EmployeeProjects;
