import "../css/HRProjectDetails.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function HRProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "ongoing",
    start_date: "",
    end_date: "",
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const employeeMap = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees]
  );

  const employeeName = (id) => {
    const employee = employeeMap.get(id);
    return employee
      ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
      : `EMP-${id}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [projectsResponse, employeesResponse, reportsResponse] = await Promise.all([
        fetch(`${API_URL}/projects/all`, { headers }),
        fetch(`${API_URL}/employees`, { headers }),
        fetch(`${API_URL}/work-reports/all`, { headers }),
      ]);

      const projectsData = await projectsResponse.json();
      const employeesData = await employeesResponse.json();
      const reportsData = await reportsResponse.json();

      if (!projectsResponse.ok) throw new Error(projectsData.detail || "Failed to load project.");
      if (!employeesResponse.ok) throw new Error(employeesData.detail || "Failed to load employees.");
      if (!reportsResponse.ok) throw new Error(reportsData.detail || "Failed to load work reports.");

      const found = projectsData.find((item) => String(item.id) === String(projectId));
      if (!found) throw new Error("Project not found.");

      setProject(found);
      setEmployees(employeesData);
      setReports(reportsData);
      setForm({
        name: found.name || "",
        description: found.description || "",
        status: found.status || "ongoing",
        start_date: found.start_date || "",
        end_date: found.end_date || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/hr-login");
      return;
    }
    loadData();
  }, [projectId]);

  const saveProject = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      setError("");
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to update project.");
      setMessage("Project updated successfully.");
      setEditing(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      setSaving(true);
      setMessage("");
      setError("");
      const response = await fetch(
        `${API_URL}/projects/${projectId}/employees/${selectedEmployee}`,
        { method: "POST", headers }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to assign employee.");
      setSelectedEmployee("");
      setMessage("Employee assigned successfully.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeEmployee = async (employeeId) => {
    if (!window.confirm(`Remove ${employeeName(employeeId)} from this project?`)) return;
    try {
      setSaving(true);
      setMessage("");
      setError("");
      const response = await fetch(
        `${API_URL}/projects/${projectId}/employees/${employeeId}`,
        { method: "DELETE", headers }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to remove employee.");
      setMessage("Employee removed from project.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async () => {
    if (!window.confirm(`Delete project "${project?.name}"? This cannot be undone.`)) return;
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to delete project.");
      navigate("/hr-projects");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="project-detail-page"><div className="project-detail-card">Loading project...</div></main>;
  }

  if (error && !project) {
    return (
      <main className="project-detail-page">
        <div className="project-detail-card">
          <p className="project-error">{error}</p>
          <button className="project-secondary-btn" onClick={() => navigate("/hr-projects")}>← Back to Projects</button>
        </div>
      </main>
    );
  }

  const assignedIds = project?.assigned_employee_ids || [];
  const assignedSet = new Set(assignedIds);
  const availableEmployees = employees.filter(
    (employee) => employee.role === "employee" && !assignedSet.has(employee.id)
  );
  const projectReports = reports.filter((report) =>
    (report.projects || []).some((item) => String(item.id) === String(projectId))
  );

  return (
    <main className="project-detail-page">
      <div className="project-detail-heading">
        <div>
          <button className="project-back-btn" onClick={() => navigate("/hr-projects")}>← Back to Projects</button>
          <span className="eyebrow">PROJECT DETAILS</span>
          <h1>{project.name}</h1>
          <p>View project information, assigned employees, and submitted work reports.</p>
        </div>
        <div className="project-detail-actions">
          <button className="project-secondary-btn" onClick={() => setEditing(!editing)}>{editing ? "Cancel Edit" : "Edit Project"}</button>
          <button className="project-danger-btn" onClick={deleteProject} disabled={saving}>Delete Project</button>
        </div>
      </div>

      {message && <div className="project-success">{message}</div>}
      {error && <div className="project-error project-alert">{error}</div>}

      {editing && (
        <section className="project-detail-card">
          <div className="project-card-heading"><div><span className="eyebrow">EDIT PROJECT</span><h2>Project information</h2></div></div>
          <form className="project-edit-form" onSubmit={saveProject}>
            <label>Project Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></label>
            <label>Start Date<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
            <label>End Date<input type="date" value={form.end_date || ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
            <label className="full">Description<textarea rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <div className="full"><button className="project-primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>
          </form>
        </section>
      )}

      <section className="project-detail-grid">
        <div className="project-detail-card project-overview-card">
          <div className="project-card-heading"><div><span className="eyebrow">OVERVIEW</span><h2>Project information</h2></div><span className={`status-badge ${project.status}`}>{project.status}</span></div>
          <div className="project-meta-grid">
            <div><span>Start date</span><strong>{project.start_date || "—"}</strong></div>
            <div><span>End date</span><strong>{project.end_date || "—"}</strong></div>
          </div>
          <div className="project-description-block"><span>Description</span><p>{project.description || "No project description has been added."}</p></div>
        </div>

        <div className="project-detail-card">
          <div className="project-card-heading"><div><span className="eyebrow">TEAM</span><h2>Assigned employees</h2></div><strong>{assignedIds.length}</strong></div>
          <div className="assign-row">
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} disabled={!availableEmployees.length || saving}>
              <option value="">Select employee to assign</option>
              {availableEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name} (EMP-{employee.id})</option>)}
            </select>
            <button className="project-primary-btn" onClick={addEmployee} disabled={!selectedEmployee || saving}>Assign</button>
          </div>
          <div className="assigned-list">
            {assignedIds.length === 0 ? <p className="muted">No employees assigned.</p> : assignedIds.map((employeeId) => (
              <div className="assigned-person" key={employeeId}>
                <div><strong>{employeeName(employeeId)}</strong><span>EMP-{employeeId}</span></div>
                <button className="remove-employee-btn" onClick={() => removeEmployee(employeeId)} disabled={saving}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="project-detail-card project-reports-card">
        <div className="project-card-heading"><div><span className="eyebrow">WORK REPORTS</span><h2>Submitted reports for this project</h2></div><strong>{projectReports.length}</strong></div>
        {projectReports.length === 0 ? (
          <div className="empty-reports">No work reports have been submitted for this project yet.</div>
        ) : (
          <div className="project-reports-list">
            {projectReports.map((report) => (
              <article className="project-report-item" key={report.id}>
                <div className="report-item-top"><div><strong>{employeeName(report.employee_id)}</strong><span>{report.report_date || "—"}</span></div><span className={`report-status ${report.status}`}>{report.status}</span></div>
                <div className="report-field"><span>Work description</span><p>{report.work_description || "—"}</p></div>
                <div className="report-field"><span>Tasks completed</span><p>{report.tasks_completed || "—"}</p></div>
                <div className="report-hours">Hours worked: <strong>{report.hours_worked ?? "—"}</strong></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default HRProjectDetails;
