import "../css/HRLeaveDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function HRLeaveDetails() {
  const navigate = useNavigate();
  const { leaveId } = useParams();

  const [leave, setLeave] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "hr") {
      navigate("/hr-login");
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setMessage("");

        const [leaveResponse, employeeResponse] = await Promise.all([
          fetch(`${API_URL}/leaves/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const leavesData = await leaveResponse.json();
        const employeesData = await employeeResponse.json();

        if (!leaveResponse.ok) {
          throw new Error(
            leavesData.detail || "Failed to load leave details."
          );
        }

        const selectedLeave = Array.isArray(leavesData)
          ? leavesData.find((item) => String(item.id) === String(leaveId))
          : null;

        if (!selectedLeave) {
          throw new Error("Leave request not found.");
        }

        setLeave(selectedLeave);

        if (employeeResponse.ok && Array.isArray(employeesData)) {
          const selectedEmployee = employeesData.find(
            (item) => String(item.id) === String(selectedLeave.employee_id)
          );
          setEmployee(selectedEmployee || null);
        }
      } catch (error) {
        setMessage(error.message || "Unable to load leave details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [leaveId, navigate, token, role]);

  const getEmployeeName = () => {
    if (!employee) return `EMP-${leave?.employee_id}`;

    const fullName = [employee.first_name, employee.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      fullName ||
      employee.full_name ||
      employee.employee_name ||
      employee.name ||
      `EMP-${leave?.employee_id}`
    );
  };

  const updateStatus = async (status) => {
    if (!leave) return;

    try {
      setMessage("");

      const response = await fetch(`${API_URL}/leaves/${leave.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { detail: text };
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update leave status.");
      }

      setLeave(data);
      setMessage(`Leave request ${status} successfully.`);
    } catch (error) {
      setMessage(error.message || "Failed to update leave status.");
    }
  };

  if (loading) {
    return (
      <main className="dashboard-main">
        <section className="hr-content">
          <div className="leave-detail-loading">Loading leave details...</div>
        </section>
      </main>
    );
  }

  if (!leave) {
    return (
      <main className="dashboard-main">
        <section className="hr-content">
          <div className="leave-detail-error">
            <span className="eyebrow">LEAVE REQUEST</span>
            <h1>Unable to load leave</h1>
            <p>{message || "Leave request not found."}</p>
            <button
              type="button"
              onClick={() => navigate("/hr-leaves")}
              className="back-leaves-btn"
            >
              ← Back to Leave Management
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-main">
      <section className="hr-content">
        <div className="leave-detail-header">
          <div>
            <span className="eyebrow">LEAVE REQUEST</span>
            <h1>Leave Details</h1>
            <p>Review the complete employee leave request.</p>
          </div>

          <button
            type="button"
            className="back-leaves-btn"
            onClick={() => navigate("/hr-leaves")}
          >
            ← Back to Leave Management
          </button>
        </div>

        {message && <div className="leave-detail-message">{message}</div>}

        <div className="leave-detail-card">
          <div className="leave-detail-employee">
            <div className="leave-detail-avatar">
              {getEmployeeName()
                .split(" ")
                .filter(Boolean)
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <span className="detail-label">EMPLOYEE</span>
              <h2>{getEmployeeName()}</h2>
              <p>Employee ID: EMP-{leave.employee_id}</p>
            </div>
          </div>

          <div className="leave-detail-status-row">
            <span className="detail-label">STATUS</span>
            <span className={`status-badge ${leave.status}`}>
              {leave.status}
            </span>
          </div>

          <div className="leave-detail-grid">
            <div className="leave-detail-field">
              <span className="detail-label">LEAVE TYPE</span>
              <strong>{leave.leave_type}</strong>
            </div>
            <div className="leave-detail-field">
              <span className="detail-label">START DATE</span>
              <strong>{leave.start_date}</strong>
            </div>
            <div className="leave-detail-field">
              <span className="detail-label">END DATE</span>
              <strong>{leave.end_date}</strong>
            </div>
            <div className="leave-detail-field">
              <span className="detail-label">REQUEST ID</span>
              <strong>#{leave.id}</strong>
            </div>
          </div>

          <div className="leave-description-section">
            <span className="detail-label">REASON / DESCRIPTION</span>
            <div className="leave-full-description">
              {leave.reason || "No description provided."}
            </div>
          </div>

          <div className="leave-detail-actions">
            {leave.status === "pending" || leave.status === "revoked" ? (
              <>
                <button
                  type="button"
                  className="approve-btn"
                  onClick={() => updateStatus("approved")}
                >
                  ✓ Approve Leave
                </button>
                <button
                  type="button"
                  className="reject-btn"
                  onClick={() => updateStatus("rejected")}
                >
                  ✕ Reject Leave
                </button>
              </>
            ) : (
              <button
                type="button"
                className="revoke-btn"
                onClick={() => updateStatus("revoked")}
              >
                ↻ Revoke Decision
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HRLeaveDetails;
