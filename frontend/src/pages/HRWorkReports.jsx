import "../css/HRWorkReports.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";

const API_URL = import.meta.env.VITE_API_URL;

function HRWorkReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editingReportId, setEditingReportId] = useState(null);
  const [rating, setRating] = useState("");

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      map[employee.id] = employee;
      return map;
    }, {});
  }, [employees]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reports;

    return reports.filter((report) => {
      const employee = employeeMap[report.employee_id];
      const employeeName = employee
        ? `${employee.first_name} ${employee.last_name}`
        : "";

      const employeeCode = `emp-${report.employee_id}`;

      const projectNames = (report.projects || [])
        .map((project) => project.name)
        .join(" ");

      return [
        employeeName,
        employeeCode,
        report.work_description,
        report.tasks_completed,
        report.status,
        projectNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [reports, search, employeeMap]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedReports,
  } = usePagination(filteredReports, 8);

  const totalReports = reports.length;
  const submittedCount = reports.filter(
    (report) => report.status === "submitted"
  ).length;
  const reviewedCount = reports.filter(
    (report) => report.status === "reviewed"
  ).length;
  const ratedCount = reports.filter(
    (report) => report.performance_rating !== null &&
      report.performance_rating !== undefined
  ).length;

  const fetchReports = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/work-reports/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch work reports."
        );
      }

      setReports(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch employees."
        );
      }

      setEmployees(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (!token || role !== "hr") {
      navigate("/hr-login");
      return;
    }

    fetchReports();
    fetchEmployees();
  }, [token, role, navigate]);

  const startEditingRating = (report) => {
    setEditingReportId(report.id);
    setRating(report.performance_rating ?? "");
  };

  const cancelEditingRating = () => {
    setEditingReportId(null);
    setRating("");
  };

  const rateReport = async (reportId) => {
    if (!rating) {
      setMessage("Please select a performance rating.");
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `${API_URL}/work-reports/${reportId}/performance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            performance_rating: Number(rating),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update performance rating."
        );
      }

      setEditingReportId(null);
      setRating("");
      await fetchReports();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employeeMap[employeeId];

    if (!employee) {
      return `EMP-${employeeId}`;
    }

    return `${employee.first_name} ${employee.last_name}`;
  };

  const getProjects = (report) => {
    if (!report.projects || report.projects.length === 0) {
      return null;
    }

    return (
      <div className="hr-report-project-list">
        {report.projects.map((project) => (
          <span
            key={project.id}
            className="hr-report-project-chip"
            title={project.name}
          >
            <span className="hr-report-project-dot"></span>
            {project.name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <main className="dashboard-main hr-work-reports-page">
      <section className="hr-content">
        <div className="page-heading hr-reports-heading">
          <div>
            <span className="eyebrow">WORKSPACE</span>
            <h1>Work Reports</h1>
            <p>
              Review employee work, see the projects they worked on,
              and track performance.
            </p>
          </div>

          <button
            className="refresh-btn"
            type="button"
            onClick={() => {
              fetchReports();
              fetchEmployees();
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {message && (
          <div className="hr-report-message">
            <span>!</span>
            {message}
          </div>
        )}

        <div className="hr-report-summary">
          <div className="hr-report-summary-card">
            <span>Total Reports</span>
            <strong>{totalReports}</strong>
          </div>

          <div className="hr-report-summary-card">
            <span>Submitted</span>
            <strong>{submittedCount}</strong>
          </div>

          <div className="hr-report-summary-card">
            <span>Reviewed</span>
            <strong>{reviewedCount}</strong>
          </div>

          <div className="hr-report-summary-card">
            <span>Rated</span>
            <strong>{ratedCount}</strong>
          </div>
        </div>

        <section className="hr-report-card">
          <div className="hr-report-card-header">
            <div>
              <span className="eyebrow">EMPLOYEE ACTIVITY</span>
              <h2>Employee Work Reports</h2>
              <p>
                Projects are shown from the work report project
                association.
              </p>
            </div>

            <div className="hr-report-search">
              <span>⌕</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee, project, report..."
                aria-label="Search work reports"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="hr-report-empty">
              <div className="hr-report-loading-dot"></div>
              Loading work reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="hr-report-empty">
              {search
                ? "No reports match your search."
                : "No work reports found."}
            </div>
          ) : (
            <>
              <div className="hr-report-table-wrapper">
                <table className="hr-work-reports-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Projects Worked On</th>
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
                          <div className="hr-report-employee">
                            <div className="hr-report-avatar">
                              {getEmployeeName(report.employee_id)
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <strong>
                                {getEmployeeName(report.employee_id)}
                              </strong>
                              <span>
                                EMP-{report.employee_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="hr-report-date">
                          {report.report_date}
                        </td>

                        <td className="hr-report-project-cell">
                          {getProjects(report) || (
                            <span className="hr-no-project">
                              No project linked
                            </span>
                          )}
                        </td>

                        <td>
                          <div
                            className="hr-report-description"
                            title={report.work_description}
                          >
                            {report.work_description}
                          </div>
                        </td>

                        <td>
                          <div
                            className="hr-report-description"
                            title={report.tasks_completed || ""}
                          >
                            {report.tasks_completed || "—"}
                          </div>
                        </td>

                        <td>
                          <span className="hr-report-hours">
                            {report.hours_worked ?? "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`hr-report-status ${report.status}`}
                          >
                            <span></span>
                            {report.status}
                          </span>
                        </td>

                        <td>
                          {editingReportId === report.id ? (
                            <div className="hr-rating-editor">
                              <select
                                value={rating}
                                onChange={(event) =>
                                  setRating(event.target.value)
                                }
                                aria-label="Performance rating"
                              >
                                <option value="">Rate</option>
                                <option value="1">1 / 5</option>
                                <option value="2">2 / 5</option>
                                <option value="3">3 / 5</option>
                                <option value="4">4 / 5</option>
                                <option value="5">5 / 5</option>
                              </select>

                              <button
                                type="button"
                                className="hr-rating-save"
                                onClick={() => rateReport(report.id)}
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                className="hr-rating-cancel"
                                onClick={cancelEditingRating}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="hr-rating-display">
                              {report.performance_rating ? (
                                <>
                                  <span className="hr-rating-star">★</span>
                                  <strong>
                                    {report.performance_rating}/5
                                  </strong>
                                </>
                              ) : (
                                <span className="hr-unrated">
                                  Not rated
                                </span>
                              )}

                              <button
                                type="button"
                                className="hr-rating-edit"
                                onClick={() =>
                                  startEditingRating(report)
                                }
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                totalItems={filteredReports.length}
                itemsPerPage={8}
              />
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default HRWorkReports;
