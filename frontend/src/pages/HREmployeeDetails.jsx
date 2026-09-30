import "../css/HREmployeeDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function HREmployeeDetails() {
  // IMPORTANT:
  // App.jsx uses /employees/:id
  const { id } = useParams();

  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || role !== "hr") {
      navigate("/hr-login");
      return;
    }

    if (!id) {
      setError("Employee ID is missing.");
      setLoading(false);
      return;
    }

    fetchEmployee();
  }, [id, navigate]);

  async function fetchEmployee() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/employees/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Unable to load employee details.";

        if (typeof data?.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data?.detail)) {
          errorMessage = data.detail
            .map((item) => item?.msg || "Invalid request")
            .join(", ");
        } else if (data?.detail) {
          errorMessage = JSON.stringify(data.detail);
        } else if (typeof data === "string") {
          errorMessage = data;
        }

        throw new Error(errorMessage);
      }

      setEmployee(data);
    } catch (err) {
      console.error("Employee details error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load employee details."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="hr-employee-details-page">
        <div className="employee-details-error">
          <h2>Loading employee...</h2>
          <p>Please wait while employee information is loaded.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="hr-employee-details-page">
        <div className="employee-details-error">
          <h2>Unable to load employee</h2>

          <p>{error}</p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button
              onClick={() => navigate("/employees")}
              className="employee-details-back"
            >
              ← Back to Employees
            </button>

            <button
              onClick={fetchEmployee}
              className="employee-details-back"
            >
              ↻ Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!employee) {
    return null;
  }

  const fullName =
    `${employee.first_name || ""} ${employee.last_name || ""}`.trim();

  const initials =
    `${employee.first_name?.charAt(0) || ""}${employee.last_name?.charAt(0) || ""}`.toUpperCase();

  return (
    <main className="hr-employee-details-page">

      {/* Back button */}
      <div className="employee-details-topbar">
        <button
          className="employee-details-back"
          onClick={() => navigate("/employees")}
        >
          ← Back to Employees
        </button>
      </div>

      {/* Employee Header */}
      <div className="employee-details-header">

        <div className="employee-large-avatar">
          {initials || "EM"}
        </div>

        <div className="employee-details-heading">
          <span className="employee-details-eyebrow">
            EMPLOYEE PROFILE
          </span>

          <h1>
            {fullName || "Employee"}
          </h1>

          <p>
            {employee.designation || "Employee"}

            {employee.department
              ? ` • ${employee.department}`
              : ""}
          </p>
        </div>

        <span
          className={`employee-details-role ${
            employee.role === "hr"
              ? "employee-details-role-hr"
              : ""
          }`}
        >
          {employee.role || "employee"}
        </span>
      </div>

      {/* Personal & Work Information */}
      <section className="employee-details-card">

        <div className="employee-details-card-heading">
          <span className="employee-details-eyebrow">
            PERSONAL & WORK INFORMATION
          </span>

          <h2>Employee Details</h2>
        </div>

        <div className="employee-details-grid">

          <div className="employee-detail-item">
            <span>Employee ID</span>
            <strong>#{employee.id}</strong>
          </div>

          <div className="employee-detail-item">
            <span>Full Name</span>
            <strong>
              {fullName || "—"}
            </strong>
          </div>

          <div className="employee-detail-item">
            <span>Email</span>
            <strong>
              {employee.email || "—"}
            </strong>
          </div>

          <div className="employee-detail-item">
            <span>Department</span>
            <strong>
              {employee.department || "—"}
            </strong>
          </div>

          <div className="employee-detail-item">
            <span>Designation</span>
            <strong>
              {employee.designation || "—"}
            </strong>
          </div>

          <div className="employee-detail-item">
            <span>Role</span>
            <strong className="capitalize">
              {employee.role || "employee"}
            </strong>
          </div>

        </div>
      </section>

      {/* Account Information */}
      <section className="employee-details-card">

        <div className="employee-details-card-heading">
          <span className="employee-details-eyebrow">
            ACCOUNT INFORMATION
          </span>

          <h2>Account</h2>
        </div>

        <div className="employee-details-grid">

          <div className="employee-detail-item">
            <span>Account Status</span>

            <strong className="status-active">
              Active
            </strong>
          </div>

          <div className="employee-detail-item">
            <span>Portal Access</span>

            <strong>
              Employee Portal
            </strong>
          </div>

          <div className="employee-detail-item">
            <span>System Role</span>

            <strong className="capitalize">
              {employee.role || "employee"}
            </strong>
          </div>

          <div className="employee-detail-item">
            <span>Employee ID</span>

            <strong>
              #{employee.id}
            </strong>
          </div>

        </div>
      </section>

    </main>
  );
}

export default HREmployeeDetails;
