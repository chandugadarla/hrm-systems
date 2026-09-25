import "../css/HRProjects.css";
import Pagination from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function HRProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedProjects,
  } = usePagination(projects, 8);

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ongoing",
    start_date: "",
    end_date: "",
    assigned_employee_id: "",
  });

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  // ================= FETCH PROJECTS =================

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/projects/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch projects."
        );
      }

      setProjects(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH EMPLOYEES =================

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

  // ================= INITIAL LOAD =================

  useEffect(() => {
    if (!token || role !== "hr") {
      navigate("/hr-login");
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchProjects();
      fetchEmployees();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [token, role, navigate]);

  // ================= FORM INPUT =================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================= CREATE PROJECT =================

const createProject = async (event) => {
  event.preventDefault();

  if (!formData.name.trim()) {
    setMessage("Project name is required.");
    return;
  }

  if (!formData.start_date) {
    setMessage("Start date is required.");
    return;
  }

  try {
    setMessage("");

    const assignedEmployeeIds = formData.assigned_employee_id
      ? [Number(formData.assigned_employee_id)]
      : [];

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      status: formData.status,
      start_date: formData.start_date,
      end_date: formData.end_date || null,

      // IMPORTANT:
      // Backend expects assigned_employee_ids
      assigned_employee_ids: assignedEmployeeIds,
    };

    console.log("Creating project:", payload);

    const response = await fetch(`${API_URL}/projects/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    let data = {};

    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response.");
      }
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to create project."
      );
    }

    setMessage(
      assignedEmployeeIds.length > 0
        ? "Project created and employee notification sent."
        : "Project created successfully."
    );

    setFormData({
      name: "",
      description: "",
      status: "ongoing",
      start_date: "",
      end_date: "",
      assigned_employee_id: "",
    });

    setShowForm(false);

    await fetchProjects();

  } catch (error) {
    console.error("Project creation error:", error);
    setMessage(error.message || "Failed to create project.");
  }
};
  // ================= UPDATE PROJECT STATUS =================

  const updateProjectStatus = async (projectId, status) => {
    try {
      setMessage("");

      const response = await fetch(
        `${API_URL}/projects/${projectId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update project status."
        );
      }

      setMessage(
        `Project marked as ${status}.`
      );

      await fetchProjects();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // ================= COUNTS =================

  const ongoingCount = projects.filter(
    (project) => project.status === "ongoing"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "completed"
  ).length;

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (item) => String(item.id) === String(employeeId)
    );

    if (!employee) {
      return employeeId ? `EMP-${employeeId}` : "Unassigned";
    }

    return `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
  };

  const getAssignedEmployeeIds = (project) => {
    if (Array.isArray(project.assigned_employee_ids)) {
      return project.assigned_employee_ids;
    }

    if (project.assigned_employee_id) {
      return [project.assigned_employee_id];
    }

    return [];
  };

  // ================= UI =================

  return (
    <section className="hr-content hr-projects-page">

          {/* HEADING */}

          <div className="page-heading">

            <div>

              <span className="eyebrow">
                WORKSPACE
              </span>

              <h1>
                Projects
              </h1>

              <p>
                Create projects, assign employees, and track project progress.
              </p>

            </div>

            <div className="project-heading-actions">

              <button
                className="refresh-btn"
                onClick={fetchProjects}
              >
                ↻ Refresh
              </button>

              <button
                className="primary-action-btn"
                onClick={() =>
                  setShowForm(!showForm)
                }
              >
                + Create Project
              </button>

            </div>

          </div>

          {/* MESSAGE */}

          {message && (
            <div className="leave-message">
              {message}
            </div>
          )}

          {/* SUMMARY */}

          <div className="leave-summary">

            <div className="summary-card">
              <span>
                Total Projects
              </span>

              <strong>
                {projects.length}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Ongoing
              </span>

              <strong>
                {ongoingCount}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Completed
              </span>

              <strong>
                {completedCount}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Completion
              </span>

              <strong>
                {projects.length > 0
                  ? Math.round(
                      (completedCount /
                        projects.length) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

          </div>

          {/* CREATE PROJECT FORM */}

          {showForm && (

            <div className="leave-card project-form-card">

              <div className="card-header">

                <div>

                  <span className="eyebrow">
                    PROJECT SETUP
                  </span>

                  <h2>
                    Create New Project
                  </h2>

                </div>

              </div>

              <form
                className="project-form"
                onSubmit={createProject}
              >

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Project Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter project name"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="ongoing">
                        Ongoing
                      </option>

                      <option value="completed">
                        Completed
                      </option>

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      End Date
                    </label>

                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Assign Employee
                    </label>

                    <select
                      name="assigned_employee_id"
                      value={
                        formData.assigned_employee_id
                      }
                      onChange={handleChange}
                    >

                      <option value="">
                        Unassigned
                      </option>

                      {employees
                        .filter(
                          (employee) =>
                            employee.role === "employee"
                        )
                        .map((employee) => (

                          <option
                            key={employee.id}
                            value={employee.id}
                          >
                            {employee.first_name}{" "}
                            {employee.last_name}
                            {" "}(
                            EMP-{employee.id})
                          </option>

                        ))}

                    </select>

                  </div>

                  <div className="form-group full-width">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the project..."
                      rows="4"
                    />

                  </div>

                </div>

                <div className="form-actions">

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-action-btn"
                  >
                    Create Project
                  </button>

                </div>

              </form>

            </div>

          )}

          {/* PROJECT TABLE */}

          <div className="leave-card">

            <div className="card-header">

              <div>

                <span className="eyebrow">
                  PROJECT PORTFOLIO
                </span>

                <h2>
                  Organization Projects
                </h2>

              </div>

            </div>

            {loading ? (

              <div className="empty-state">
                Loading projects...
              </div>

            ) : projects.length === 0 ? (

              <div className="empty-state">
                No projects found. Create your first project.
              </div>

            ) : (

              <div className="leave-table-wrapper">

                <table className="leave-table">

                  <thead>

                    <tr>
                      <th>Project</th>
                      <th>Employee</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {paginatedProjects.map((project) => (

                      <tr key={project.id}>

                        <td>
                          <button
                            type="button"
                            className="project-name-link"
                            onClick={() => navigate(`/hr-projects/${project.id}`)}
                          >
                            {project.name}
                          </button>

                          {project.description && (
                            <div className="project-description">
                              {project.description}
                            </div>
                          )}
                        </td>

                        <td>
                          {getAssignedEmployeeIds(project).length > 0 ? (
                            <div className="project-employee-list">
                              {getAssignedEmployeeIds(project).map((employeeId) => (
                                <div key={employeeId} className="project-employee-name">
                                  {getEmployeeName(employeeId)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="project-unassigned">Unassigned</span>
                          )}
                        </td>

                        <td>
                          {project.start_date}
                        </td>

                        <td>
                          {project.end_date || "—"}
                        </td>

                        <td>

                          <span
                            className={`status-badge ${project.status}`}
                          >
                            {project.status}
                          </span>

                        </td>

                        <td>

                          {project.status === "ongoing" ? (

                            <button
                              className="approve-btn"
                              onClick={() =>
                                updateProjectStatus(
                                  project.id,
                                  "completed"
                                )
                              }
                            >
                              Mark Completed
                            </button>

                          ) : (

                            <span className="processed-text">
                              Completed
                            </span>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

            </table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  totalItems={projects.length}
                  itemsPerPage={8}
                />

                </div>

              )}

          </div>

        </section>
  );
}

export default HRProjects;
