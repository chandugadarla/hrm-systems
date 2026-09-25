import "../css/EmployeePerformance.css";
import Pagination from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function EmployeePerformance() {
  const [reports, setReports] = useState([]);
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedReports,
  } = usePagination(reports, 8);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/work-reports/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load performance."
        );
      }

      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const ratedReports = reports.filter(
    (report) =>
      report.performance_rating !== null &&
      report.performance_rating !== undefined
  );

  const averageRating =
    ratedReports.length > 0
      ? (
          ratedReports.reduce(
            (total, report) =>
              total + report.performance_rating,
            0
          ) / ratedReports.length
        ).toFixed(1)
      : "—";

  return (
    <main className="dashboard-main">

      <div className="page-heading">
        <div>
          <span className="eyebrow">
            PERFORMANCE
          </span>

          <h1>
            My Performance
          </h1>

          <p>
            Review performance ratings given by HR.
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchPerformance}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="dashboard-kpis">

        <div className="kpi-card">
          <div className="kpi-header">
            <span>
              REPORTS
            </span>

            <div className="kpi-icon">
              ▤
            </div>
          </div>

          <strong>
            {reports.length}
          </strong>

          <p>
            Reports submitted
          </p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>
              RATED
            </span>

            <div className="kpi-icon">
              ✓
            </div>
          </div>

          <strong>
            {ratedReports.length}
          </strong>

          <p>
            Reports reviewed
          </p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>
              AVERAGE
            </span>

            <div className="kpi-icon">
              ↗
            </div>
          </div>

          <strong>
            {averageRating}
          </strong>

          <p>
            Average rating
          </p>
        </div>

      </div>

      <section className="leave-card">

        <div className="card-header">
          <div>
            <span className="eyebrow">
              PERFORMANCE HISTORY
            </span>

            <h2>
              Work Report Ratings
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading performance...
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            No work reports available.
          </div>
        ) : (
          <div className="leave-table-wrapper">

            <table className="work-reports-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Work</th>
                  <th>Status</th>
                  <th>Rating</th>
                </tr>
              </thead>

              <tbody>

                {paginatedReports.map((report) => (
                  <tr key={report.id}>

                    <td>
                      {report.report_date}
                    </td>

                    <td>
                      {report.work_description}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${report.status}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td>
                      {report.performance_rating
                        ? `${report.performance_rating}/5`
                        : "Not rated"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            totalItems={reports.length}
            itemsPerPage={8}
          />

          </div>

        )}

      </section>

    </main>
  );
}

export default EmployeePerformance;
