import "../css/EmployeeLeaves.css";
import Pagination from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import FeedbackModal from "../components/FeedbackModal";

const API_URL = import.meta.env.VITE_API_URL;

const readResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
};

function EmployeeLeaves() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedLeaves,
  } = usePagination(leaves, 8);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const [form, setForm] = useState({
    leave_type: "Casual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || role !== "employee") {
      navigate("/employee-login");
      return;
    }

    fetchLeaves();
  }, [navigate]);

  async function fetchLeaves() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/leaves/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load leave requests."
        );
      }

      setLeaves(data);
    } catch (err) {
      setError(
        err.message || "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const applyLeave = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.start_date || !form.end_date) {
      setError("Please select both start and end dates.");
      return;
    }

    if (form.end_date < form.start_date) {
      setError("End date cannot be before start date.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please provide a reason for your leave.");
      return;
    }

    setConfirmOpen(true);
  };

  const submitConfirmedLeave = async () => {
    setConfirmOpen(false);

    try {
      setSubmitting(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/leaves/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || "Unable to submit leave request.");
      }

      setForm({
        leave_type: "Casual",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setFeedback({
        open: true,
        type: "success",
        title: "Request submitted",
        message: "Your leave request has been submitted successfully and is awaiting HR review.",
      });

      await fetchLeaves();
    } catch (err) {
      setError(err.message || "Unable to submit leave request.");
      setFeedback({
        open: true,
        type: "error",
        title: "Submission failed",
        message: err.message || "Unable to submit leave request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "approved";
    }

    if (status === "rejected") {
      return "rejected";
    }

    return "pending";
  };

  const pendingCount = leaves.filter(
    (leave) => leave.status === "pending"
  ).length;

  const approvedCount = leaves.filter(
    (leave) => leave.status === "approved"
  ).length;

  const rejectedCount = leaves.filter(
    (leave) => leave.status === "rejected"
  ).length;

  return (
    <main className="employee-leave-main">

      {/* PAGE HEADER */}

      <div className="employee-leave-heading">

        <div>
          <span className="page-eyebrow">
            TIME OFF
          </span>

          <h1>
            Leave Management
          </h1>

          <p>
            Submit leave requests and track their approval status.
          </p>
        </div>

        <button
          type="button"
          className="employee-leave-refresh"
          onClick={fetchLeaves}
        >
          ↻ Refresh
        </button>

      </div>


      {/* SUMMARY */}

      <section className="employee-leave-summary">

        <div className="employee-leave-summary-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <p>Awaiting HR review</p>
        </div>

        <div className="employee-leave-summary-card">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
          <p>Approved requests</p>
        </div>

        <div className="employee-leave-summary-card">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
          <p>Rejected requests</p>
        </div>

        <div className="employee-leave-summary-card">
          <span>Total Requests</span>
          <strong>{leaves.length}</strong>
          <p>Your leave history</p>
        </div>

      </section>


      {/* MESSAGES */}

      {error && (
        <div className="employee-leave-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="employee-leave-message success">
          {success}
        </div>
      )}


      {/* MAIN CONTENT */}

      <section className="employee-leave-grid">

        {/* APPLY LEAVE */}

        <div className="employee-leave-card">

          <div className="employee-leave-card-header">

            <span className="panel-eyebrow">
              NEW REQUEST
            </span>

            <h2>
              Apply for leave
            </h2>

            <p>
              Provide the details for your time-off request.
            </p>

          </div>


          <form
            className="employee-leave-form"
            onSubmit={applyLeave}
          >

            <div className="employee-leave-field">

              <label>
                Leave type
              </label>

              <select
                name="leave_type"
                value={form.leave_type}
                onChange={handleChange}
              >
                <option value="Casual">
                  Casual
                </option>

                <option value="Sick">
                  Sick
                </option>

                <option value="Earned">
                  Earned
                </option>

                <option value="Emergency">
                  Emergency
                </option>
              </select>

            </div>


            <div className="employee-leave-date-grid">

              <div className="employee-leave-field">

                <label>
                  Start date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="employee-leave-field">

                <label>
                  End date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            <div className="employee-leave-field">

              <label>
                Reason
              </label>

              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Briefly explain the reason for your leave..."
                rows="5"
                required
              />

            </div>


            <button
              type="submit"
              className="employee-leave-submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit request"}

              {!submitting && (
                <span>→</span>
              )}
            </button>

          </form>

        </div>


        {/* HISTORY */}

        <div className="employee-leave-card">

          <div className="employee-leave-card-header history">

            <div>

              <span className="panel-eyebrow">
                REQUEST HISTORY
              </span>

              <h2>
                Your leave requests
              </h2>

            </div>

            <span className="employee-leave-count">
              {leaves.length}
            </span>

          </div>


          {loading ? (

            <div className="employee-leave-loading">
              Loading requests...
            </div>

          ) : leaves.length === 0 ? (

            <div className="employee-leave-empty">

              <div className="employee-leave-empty-icon">
                ◷
              </div>

              <strong>
                No leave requests yet
              </strong>

              <p>
                Your submitted requests will appear here.
              </p>

            </div>

          ) : (

            <div className="employee-leave-list">

              {paginatedLeaves.map((leave) => (

                <article
                  className="employee-leave-request"
                  key={leave.id}
                >

                  <div className="employee-leave-request-top">

                    <div>
                      <strong>
                        {leave.leave_type} Leave
                      </strong>

                      <span>
                        {leave.start_date} → {leave.end_date}
                      </span>
                    </div>

                    <span
                      className={`employee-leave-status ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>

                  </div>


                  <p>
                    {leave.reason}
                  </p>


                  <small>
                    Submitted{" "}
                    {new Date(
                      leave.created_at
                    ).toLocaleDateString("en-IN")}
                  </small>

                </article>

              ))}

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
        open={confirmOpen}
        title="Submit leave request?"
        message={`Submit your ${form.leave_type.toLowerCase()} leave request from ${form.start_date} to ${form.end_date}?`}
        confirmText="Submit request"
        cancelText="Review"
        onConfirm={submitConfirmedLeave}
        onCancel={() => setConfirmOpen(false)}
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

export default EmployeeLeaves;
