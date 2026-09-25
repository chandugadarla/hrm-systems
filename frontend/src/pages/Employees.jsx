import "../css/Employees.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 8;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    designation: "",
    role: "employee",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || role !== "hr") {
      navigate("/hr-login");
      return;
    }

    fetchEmployees();
  }, [navigate]);

  async function fetchEmployees() {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load employees.");
      }

      setEmployees(data);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setEditingEmployee(null);

    setForm({
      first_name: "",
      last_name: "",
      email: "",
      department: "",
      designation: "",
      role: "employee",
    });

    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setForm({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      department: employee.department || "",
      designation: employee.designation || "",
      role: employee.role || "employee",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const saveEmployee = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

      const url = editingEmployee
        ? `${API_URL}/employees/${editingEmployee.id}`
        : `${API_URL}/employees`;

      const response = await fetch(url, {
        method: editingEmployee ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to save employee.");
      }

      closeModal();
      fetchEmployees();

    } catch (err) {
      setError(err.message);
    }
  };

  const deleteEmployee = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/employees/${employee.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete employee.");
      }

      fetchEmployees();

    } catch (err) {
      setError(err.message);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const value = search.toLowerCase();

    return (
      `${employee.first_name} ${employee.last_name}`
        .toLowerCase()
        .includes(value) ||
      employee.email?.toLowerCase().includes(value) ||
      employee.department?.toLowerCase().includes(value) ||
      employee.designation?.toLowerCase().includes(value)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / employeesPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;

  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    endIndex
  );

  const visibleStart =
    filteredEmployees.length === 0 ? 0 : startIndex + 1;

  const visibleEnd = Math.min(
    endIndex,
    filteredEmployees.length
  );

  return (
    <>
      <main className="employees-main">

          <div className="employees-heading">

            <div>
              <span className="page-eyebrow">
                PEOPLE
              </span>

              <h1>Employees</h1>

              <p>
                Manage your organization's people and their information.
              </p>
            </div>

            <button
              className="add-employee-button"
              onClick={openAddModal}
            >
              <span>+</span>
              Add employee
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="employee-error">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}


         <div className="employees-page-search">
            <span className="employees-search-icon">⌕</span>

          <input
           type="text"
          className="employees-search-input"
            placeholder="Search employees by name, email, department, or role..."
             value={search}
             onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
               }}
               />

               {search && (
              <button
               type="button"
                className="employees-search-clear"
                  onClick={() => {
              setSearch("");
               setCurrentPage(1);
              }}
                 >
              ×
             </button>
               )}
              </div>

          {/* Employee Table */}
          <section className="employees-panel">

            <div className="employees-panel-header">

              <div>
                <strong>All employees</strong>
                <span>
                  {employees.length} total
                </span>
              </div>

              <button
                className="refresh-button"
                onClick={fetchEmployees}
              >
                ↻ Refresh
              </button>

            </div>

            {loading ? (
              <div className="employees-loading">
                Loading employees...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="employees-empty">
                <div>♙</div>
                <strong>No employees found</strong>
                <p>
                  Try a different search or add a new employee.
                </p>
              </div>
            ) : (
              <div className="table-wrapper">

                <table className="employees-table">

                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>DEPARTMENT</th>
                      <th>DESIGNATION</th>
                      <th>ROLE</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {paginatedEmployees.map((employee) => (

                      <tr key={employee.id}>

                        <td>
                          <div className="employee-cell">

                            <div className="employee-avatar">
                              {employee.first_name?.charAt(0)}
                              {employee.last_name?.charAt(0)}
                            </div>

                            <div>
                              <button
                                  type="button"
                                  className="employee-name-link"
                                  onClick={() =>
                                    navigate(`/employees/${employee.id}`)
                                  }
                                >
                                  {employee.first_name}{" "}
                                  {employee.last_name}
                                </button>

                              <span>
                                {employee.email}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          {employee.department || "—"}
                        </td>

                        <td>
                          {employee.designation || "—"}
                        </td>

                        <td>
                          <span
                            className={`role-badge ${
                              employee.role === "hr"
                                ? "hr-role"
                                : ""
                            }`}
                          >
                            {employee.role}
                          </span>
                        </td>

                        <td>

                          <div className="table-actions">

                            <button
                              onClick={() =>
                                openEditModal(employee)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-action"
                              onClick={() =>
                                deleteEmployee(employee)
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            )}

            {!loading && filteredEmployees.length > 0 && (
              <div className="employees-pagination">
                <div className="pagination-summary">
                  Showing <strong>{visibleStart}</strong>–<strong>{visibleEnd}</strong>{" "}
                  of <strong>{filteredEmployees.length}</strong> employees
                </div>

                <div className="pagination-controls">
                  <button
                    type="button"
                    className="pagination-button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safeCurrentPage === 1}
                  >
                    ← Previous
                  </button>

                  <span className="pagination-page">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="pagination-button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={safeCurrentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

          </section>

        </main>

      {/* Add/Edit Modal */}
      {showModal && (

        <div className="modal-overlay">

          <div className="employee-modal">

            <div className="modal-header">

              <div>
                <span className="page-eyebrow">
                  {editingEmployee ? "EMPLOYEE" : "NEW EMPLOYEE"}
                </span>

                <h2>
                  {editingEmployee
                    ? "Edit employee"
                    : "Add employee"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={saveEmployee}>

              <div className="form-row">

                <div className="employee-form-group">
                  <label>First name</label>

                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>Last name</label>

                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </div>

              </div>

              <div className="employee-form-group">

                <label>Work email</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />

              </div>

              <div className="form-row">

                <div className="employee-form-group">

                  <label>Department</label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                  />

                </div>

                <div className="employee-form-group">

                  <label>Designation</label>

                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                  />

                </div>

              </div>

              <div className="employee-form-group">

                <label>Role</label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="employee">
                    Employee
                  </option>

                  <option value="hr">
                    HR
                  </option>
                </select>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingEmployee
                    ? "Save changes"
                    : "Add employee"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}
    </>
  );
}

export default Employees;
