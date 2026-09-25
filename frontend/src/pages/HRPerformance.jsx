import "../css/HRPerformance.css";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function HRPerformance() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || localStorage.getItem("role") !== "hr") {
      navigate("/hr-login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/work-reports/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
        if (!response.ok) throw new Error(data.detail || "Unable to load performance data.");
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load performance data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const rated = reports.filter((report) => Number.isFinite(report.performance_rating));
  const average = rated.length
    ? (rated.reduce((sum, report) => sum + report.performance_rating, 0) / rated.length).toFixed(1)
    : "—";

  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(reports, 8);

  const stats = useMemo(() => ({
    total: reports.length,
    rated: rated.length,
    pending: reports.length - rated.length,
  }), [reports, rated.length]);

  return (
    <main className="dashboard-main">
      <section className="hr-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">WORKSPACE</span>
            <h1>Performance</h1>
            <p>Review employee report ratings and overall performance progress.</p>
          </div>
          <button type="button" className="refresh-btn" onClick={() => window.location.reload()}>↻ Refresh</button>
        </div>

        <div className="leave-summary">
          <div className="summary-card"><span>Total Reports</span><strong>{stats.total}</strong></div>
          <div className="summary-card"><span>Rated Reports</span><strong>{stats.rated}</strong></div>
          <div className="summary-card"><span>Awaiting Rating</span><strong>{stats.pending}</strong></div>
          <div className="summary-card"><span>Average Rating</span><strong>{average}/5</strong></div>
        </div>

        {error && <div className="leave-message">{error}</div>}

        <div className="leave-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">PERFORMANCE TRACKER</span>
              <h2>Employee report performance</h2>
            </div>
            <button type="button" className="refresh-btn" onClick={() => navigate("/hr-work-reports")}>
              Open Work Reports
            </button>
          </div>

          {loading ? (
            <div className="empty-state">Loading performance records...</div>
          ) : reports.length === 0 ? (
            <div className="empty-state">No work reports available yet.</div>
          ) : (
            <>
              <div className="leave-table-wrapper">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Work</th>
                      <th>Status</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((report) => (
                      <tr key={report.id}>
                        <td>EMP-{report.employee_id}</td>
                        <td>{report.report_date}</td>
                        <td className="reason-cell">{report.work_description}</td>
                        <td><span className={`status-badge ${report.status}`}>{report.status}</span></td>
                        <td>{report.performance_rating ? `${report.performance_rating}/5` : "Not rated"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                totalItems={reports.length}
                itemsPerPage={8}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default HRPerformance;
