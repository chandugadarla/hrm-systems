import "../css/HRLeaves.css";
import Pagination from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import FeedbackModal from "../components/FeedbackModal";

const API_URL = "http://127.0.0.1:8000";

function HRLeaves() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [feedback, setFeedback] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedLeaves,
  } = usePagination(leaves, 8);

  const fetchEmployees = async () => {
    const response = await fetch(`${API_URL}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch employees.");
    }

    setEmployees(Array.isArray(data) ? data : []);
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/leaves/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch leave requests.");
      }

      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch leaves error:", error);
      setMessage(error.message || "Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || role !== "hr") {
      navigate("/hr-login");
      return;
    }

    const loadData = async () => {
      try {
        await Promise.all([fetchLeaves(), fetchEmployees()]);
      } catch (error) {
        console.error("Leave management loading error:", error);
        setMessage(error.message || "Unable to load leave management data.");
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, navigate]);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (item) => String(item.id) === String(employeeId)
    );

    if (!employee) {
      return `EMP-${employeeId}`;
    }

    const fullName = [employee.first_name, employee.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      fullName ||
      employee.full_name ||
      employee.employee_name ||
      employee.name ||
      `EMP-${employeeId}`
    );
  };

  const requestLeaveStatusChange = (leaveId, status) => {
    setConfirmAction({ leaveId, status });
  };

  const updateLeaveStatus = async () => {
    if (!confirmAction) return;

    const { leaveId, status } = confirmAction;
    setConfirmAction(null);

    try {
      const response = await fetch(`${API_URL}/leaves/${leaveId}/status`, {
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

      setFeedback({
        open: true,
        type: "success",
        title: `Leave ${status}`,
        message: `The leave request has been ${status} successfully.`,
      });

      await fetchLeaves();
    } catch (error) {
      setFeedback({
        open: true,
        type: "error",
        title: "Update failed",
        message: error.message || "Failed to update leave status.",
      });
    }
  };

  const revokeLeave = async (leaveId) => {
    try {
      const response = await fetch(`${API_URL}/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "revoked" }),
      });

      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { detail: text };
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to revoke leave.");
      }

      setFeedback({
        open: true,
        type: "success",
        title: "Leave Revoked",
        message: "The leave decision has been revoked successfully.",
      });

      await fetchLeaves();
    } catch (error) {
      setFeedback({
        open: true,
        type: "error",
        title: "Revoke Failed",
        message: error.message || "Failed to revoke leave.",
      });
    }
  };

  const pendingCount = leaves.filter((leave) => leave.status === "pending").length;
  const approvedCount = leaves.filter((leave) => leave.status === "approved").length;
  const rejectedCount = leaves.filter((leave) => leave.status === "rejected").length;

  const getStatusClass = (status) => `status-badge ${status}`;

  return (
    <main className="dashboard-main">
      <section className="hr-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">WORKSPACE</span>
            <h1>Leave Management</h1>
            <p>Review and manage employee leave requests.</p>
          </div>

          <button className="refresh-btn" type="button" onClick={fetchLeaves}>
            ↻ Refresh
          </button>
        </div>

        {message && <div className="leave-message">{message}</div>}

        <div className="leave-summary">
          <div className="summary-card">
            <span>Total Requests</span>
            <strong>{leaves.length}</strong>
          </div>
          <div className="summary-card">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="summary-card">
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
          <div className="summary-card">
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

        <div className="leave-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">REQUESTS</span>
              <h2>Employee Leave Requests</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading leave requests...</div>
          ) : leaves.length === 0 ? (
            <div className="empty-state">No leave requests found.</div>
          ) : (
            <div className="leave-table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <button
                          type="button"
                          className="employee-name-link"
                          onClick={() => navigate(`/hr-leaves/${leave.id}`)}
                          title="Open leave details"
                        >
                          {getEmployeeName(leave.employee_id)}
                        </button>
                      </td>

                      <td>{leave.leave_type}</td>
                      <td>{leave.start_date}</td>
                      <td>{leave.end_date}</td>

                      <td className="reason-cell">
                        <button
                          type="button"
                          className="view-leave-btn"
                          onClick={() => navigate(`/hr-leaves/${leave.id}`)}
                        >
                          View description →
                        </button>
                      </td>

                      <td>
                        <span className={getStatusClass(leave.status)}>
                          {leave.status}
                        </span>
                      </td>

                      <td>
                        {leave.status === "pending" || leave.status === "revoked" ? (
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="approve-btn"
                              onClick={() =>
                                requestLeaveStatusChange(leave.id, "approved")
                              }
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() =>
                                requestLeaveStatusChange(leave.id, "rejected")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : leave.status === "approved" || leave.status === "rejected" ? (
                          <button
                            type="button"
                            className="revoke-btn"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to revoke this leave decision?")) {
                                revokeLeave(leave.id);
                              }
                            }}
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="processed-text">Revoked</span>
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
                totalItems={leaves.length}
                itemsPerPage={8}
              />
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={
          confirmAction?.status === "approved"
            ? "Approve leave request?"
            : "Reject leave request?"
        }
        message={
          confirmAction?.status === "approved"
            ? "This will approve the employee's leave request."
            : "This will reject the employee's leave request."
        }
        confirmText={confirmAction?.status === "approved" ? "Approve" : "Reject"}
        cancelText="Cancel"
        danger={confirmAction?.status === "rejected"}
        onConfirm={updateLeaveStatus}
        onCancel={() => setConfirmAction(null)}
      />

      <FeedbackModal
        open={feedback.open}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback((previous) => ({ ...previous, open: false }))}
      />
    </main>
  );
}

export default HRLeaves;
