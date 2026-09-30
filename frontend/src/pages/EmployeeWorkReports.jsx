import { useEffect, useState } from "react";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import "../css/EmployeeWorkReports.css";

const API_URL = import.meta.env.VITE_API_URL;

function EmployeeWorkReports() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedProjectIds, setSelectedProjectIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    report_date: "",
    work_description: "",
    tasks_completed: "",
    hours_worked: "",
  });

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedReports,
  } = usePagination(reports, 8);

  // --------------------------------------------------
  // GET TOKEN
  // --------------------------------------------------

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // --------------------------------------------------
  // FETCH PROJECTS
  // --------------------------------------------------

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}/projects/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await response.text();

      let data;

      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        throw new Error(
          `Server returned invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to load assigned projects."
        );
      }

      const projectList = Array.isArray(data)
        ? data
        : Array.isArray(data?.projects)
        ? data.projects
        : [];

      setProjects(projectList);
    } catch (err) {
      console.error("FETCH PROJECTS ERROR:", err);

      setProjects([]);

      setError(
        err?.message || "Unable to load assigned projects."
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH REPORTS
  // --------------------------------------------------

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}/work-reports/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await response.text();

      let data;

      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        throw new Error(
          `Server returned invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to load work reports."
        );
      }

      const reportList = Array.isArray(data)
        ? data
        : Array.isArray(data?.reports)
        ? data.reports
        : [];

      setReports(reportList);
    } catch (err) {
      console.error("FETCH REPORTS ERROR:", err);

      setReports([]);

      setError(
        err?.message || "Unable to load work reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchProjects();
    fetchReports();
  }, []);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // PROJECT SELECTION
  // --------------------------------------------------

  const toggleProject = (projectId) => {
    setSelectedProjectIds((previous) => {
      if (previous.includes(projectId)) {
        return previous.filter((id) => id !== projectId);
      }

      return [...previous, projectId];
    });
  };

  // --------------------------------------------------
  // SUBMIT REPORT
  // --------------------------------------------------

  const submitReport = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (selectedProjectIds.length === 0) {
      setError("Please select at least one project.");
      return;
    }

    if (!form.report_date) {
      setError("Please select a report date.");
      return;
    }

    if (!form.work_description.trim()) {
      setError("Please enter the work description.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}/work-reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          report_date: form.report_date,
          project_ids: selectedProjectIds,
          work_description: form.work_description,
          tasks_completed: form.tasks_completed,
          hours_worked: form.hours_worked
            ? Number(form.hours_worked)
            : null,
        }),
      });

      const text = await response.text();

      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Server returned invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to submit work report."
        );
      }

      setMessage("Work report submitted successfully.");

      setForm({
        report_date: "",
        work_description: "",
        tasks_completed: "",
        hours_worked: "",
      });

      setSelectedProjectIds([]);

      await fetchReports();
    } catch (err) {
      console.error("SUBMIT REPORT ERROR:", err);

      setError(
        err?.message || "Unable to submit work report."
      );
    }
  };

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const refreshPage = async () => {
    setError("");
    setMessage("");

    await Promise.all([
      fetchProjects(),
      fetchReports(),
    ]);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="dashboard-main employee-work-reports-page">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE</span>

          <h1>Work Reports</h1>

          <p>
            Submit your daily work and review your previous reports.
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={refreshPage}
          disabled={loading || projectsLoading}
        >
          {loading || projectsLoading
            ? "Loading..."
            : "↻ Refresh"}
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="leave-message">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="dashboard-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* =========================================
          NEW REPORT
      ========================================= */}

      <section className="leave-apply-panel">

        <div className="card-header">
          <div>
            <span className="eyebrow">
              NEW REPORT
            </span>

            <h2>
              Submit work report
            </h2>
          </div>
        </div>

        <form onSubmit={submitReport}>

          {/* DATE + HOURS */}

          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="report_date">
                Report Date
              </label>

              <input
                id="report_date"
                type="date"
                name="report_date"
                value={form.report_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hours_worked">
                Hours Worked
              </label>

              <input
                id="hours_worked"
                type="number"
                name="hours_worked"
                min="0"
                max="24"
                step="0.5"
                placeholder="e.g. 8"
                value={form.hours_worked}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* =====================================
              PROJECTS
          ===================================== */}

          <div className="form-group work-report-projects">

            <label>
              Projects{" "}
              <span className="required-mark">
                *
              </span>
            </label>

            {projectsLoading ? (

              <div className="project-selection-message">
                Loading assigned projects...
              </div>

            ) : projects.length === 0 ? (

              <div className="project-selection-message">
                No projects are currently assigned to you.
              </div>

            ) : (

              <div className="project-checkbox-list">

                {projects.map((project) => {

                  const projectId = project.id;

                  const isSelected =
                    selectedProjectIds.includes(projectId);

                  return (
                    <label
                      key={projectId}
                      className={`project-checkbox ${
                        isSelected ? "selected" : ""
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleProject(projectId)
                        }
                      />

                      <span className="project-checkbox-content">

                        <strong>
                          {project.name ||
                            "Unnamed Project"}
                        </strong>

                        <small>
                          {project.status ||
                            "Status not specified"}
                        </small>

                      </span>

                    </label>
                  );
                })}

              </div>
            )}

            {selectedProjectIds.length === 0 &&
              projects.length > 0 && (
                <small className="form-hint">
                  Select at least one project for this work report.
                </small>
              )}

          </div>

          {/* WORK DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="work_description">
              Work Description
            </label>

            <textarea
              id="work_description"
              name="work_description"
              placeholder="Describe the work you completed..."
              value={form.work_description}
              onChange={handleChange}
              rows="5"
              required
            />

          </div>

          {/* TASKS */}

          <div className="form-group">

            <label htmlFor="tasks_completed">
              Tasks Completed
            </label>

            <textarea
              id="tasks_completed"
              name="tasks_completed"
              placeholder="List the tasks you completed..."
              value={form.tasks_completed}
              onChange={handleChange}
              rows="5"
            />

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button"
          >
            Submit Report →
          </button>

        </form>

      </section>

      {/* =========================================
          REPORT HISTORY
      ========================================= */}

      <section className="leave-card">

        <div className="card-header">

          <div>
            <span className="eyebrow">
              REPORT HISTORY
            </span>

            <h2>
              My Work Reports
            </h2>
          </div>

        </div>

        {loading ? (

          <div className="empty-state">
            Loading work reports...
          </div>

        ) : reports.length === 0 ? (

          <div className="empty-state">
            No work reports submitted yet.
          </div>

        ) : (

          <div className="leave-table-wrapper">

            <table className="work-reports-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Work Description</th>
                  <th>Tasks Completed</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Performance</th>
                </tr>
              </thead>

              <tbody>

                {paginatedReports.map((report) => (

                  <tr key={report.id}>

                    <td>
                      {report.report_date || "-"}
                    </td>

                    <td>
                      {report.work_description || "-"}
                    </td>

                    <td>
                      {report.tasks_completed || "-"}
                    </td>

                    <td>
                      {report.hours_worked ?? "-"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          report.status || ""
                        }`}
                      >
                        {report.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      {report.performance_rating ??
                        "Not rated"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                totalItems={reports.length}
                itemsPerPage={8}
              />
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default EmployeeWorkReports;
