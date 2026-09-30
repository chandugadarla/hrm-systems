import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "../css/EmployeeNotificationDetails.css";

const READ_NOTIFICATIONS_KEY =
  "employee_read_notifications";

const NOTIFICATIONS_CACHE_KEY =
  "employee_notifications_cache";

function EmployeeNotificationDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [notification, setNotification] =
    useState(location.state?.notification || null);

  const [loading, setLoading] = useState(
    !location.state?.notification
  );

  useEffect(() => {
    /*
     * If notification was passed through React Router,
     * use it immediately.
     */
    if (location.state?.notification) {
      setNotification(location.state.notification);
      setLoading(false);
      return;
    }

    /*
     * Otherwise recover the notification from cache.
     */
    try {
      const cached = localStorage.getItem(
        NOTIFICATIONS_CACHE_KEY
      );

      if (cached) {
        const notifications = JSON.parse(cached);

        if (Array.isArray(notifications)) {
          const found = notifications.find(
            (item) =>
              String(item.id) === String(id)
          );

          if (found) {
            setNotification(found);
          }
        }
      }
    } catch (error) {
      console.error(
        "Unable to recover notification:",
        error
      );
    }

    /*
     * Also check the selected notification cache.
     */
    try {
      if (!notification) {
        const selected = sessionStorage.getItem(
          "selected_employee_notification"
        );

        if (selected) {
          const parsed = JSON.parse(selected);

          if (
            parsed &&
            String(parsed.id) === String(id)
          ) {
            setNotification(parsed);
          }
        }
      }
    } catch (error) {
      console.error(
        "Unable to recover selected notification:",
        error
      );
    }

    setLoading(false);
  }, [id, location.state]);

  const getReadIds = () => {
    try {
      const stored = localStorage.getItem(
        READ_NOTIFICATIONS_KEY
      );

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const markAsRead = () => {
    const ids = getReadIds();

    if (!ids.includes(String(id))) {
      localStorage.setItem(
        READ_NOTIFICATIONS_KEY,
        JSON.stringify([
          ...ids,
          String(id),
        ])
      );
    }

    window.dispatchEvent(
      new CustomEvent(
        "employee-notification-read",
        {
          detail: {
            notificationId: String(id),
          },
        }
      )
    );
  };

  useEffect(() => {
    if (id) {
      markAsRead();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getTypeClass = (type) => {
    const value = (type || "").toLowerCase();

    if (value.includes("holiday")) {
      return "holiday";
    }

    if (value.includes("festival")) {
      return "festival";
    }

    if (value.includes("birthday")) {
      return "birthday";
    }

    return "announcement";
  };

  const getTypeLabel = (type) => {
    const value = (type || "").toLowerCase();

    if (value.includes("holiday")) {
      return "Holiday";
    }

    if (value.includes("festival")) {
      return "Festival";
    }

    if (value.includes("birthday")) {
      return "Birthday";
    }

    return "Announcement";
  };

  if (loading) {
    return (
      <main className="dashboard-main employee-notification-details-page">
        <div className="notification-details-loading">
          Loading notification...
        </div>
      </main>
    );
  }

  if (!notification) {
    return (
      <main className="dashboard-main employee-notification-details-page">

        <section className="notification-details-not-found">

          <div className="notification-details-icon">
            !
          </div>

          <h1>
            Notification not found
          </h1>

          <p>
            This notification could not be found.
            It may have been removed or is no longer
            available.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/employee-notifications"
              )
            }
          >
            ← Back to Notifications
          </button>

        </section>

      </main>
    );
  }

  return (
    <main className="dashboard-main employee-notification-details-page">

      {/* HEADER */}
      <div className="notification-details-header">

        <button
          type="button"
          className="notification-back-button"
          onClick={() =>
            navigate(
              "/employee-notifications"
            )
          }
        >
          ← Back to Notifications
        </button>

      </div>

      {/* DETAIL CARD */}
      <article className="notification-details-card">

        <div className="notification-details-top">

          <span
            className={`notification-details-type ${getTypeClass(
              notification.notification_type
            )}`}
          >
            {getTypeLabel(
              notification.notification_type
            )}
          </span>

          {notification.event_date && (
            <time
              dateTime={
                notification.event_date
              }
            >
              {formatDate(
                notification.event_date
              )}
            </time>
          )}

        </div>

        <div className="notification-details-content">

          <h1>
            {notification.title ||
              "Notification"}
          </h1>

          <div className="notification-details-divider" />

          <div className="notification-details-message">
            {notification.message ||
              "No description available."}
          </div>

        </div>

        <div className="notification-details-footer">

          <span>
            ✓ Notification viewed
          </span>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/employee-notifications"
              )
            }
          >
            Back to Notifications
          </button>

        </div>

      </article>

    </main>
  );
}

export default EmployeeNotificationDetails;
