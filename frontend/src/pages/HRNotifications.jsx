import "../css/HRNotifications.css";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const HOLIDAY_API = "https://date.nager.at/api/v3/PublicHolidays";

const FALLBACK_EVENTS = [
  {
    date: "2026-09-14",
    name: "Ganesh Chaturthi",
    type: "Festival",
  },
  {
    date: "2026-09-17",
    name: "Vishwakarma Puja",
    type: "Festival",
  },
  {
    date: "2026-09-25",
    name: "Navratri Begins",
    type: "Festival",
  },
];

/* ---------------------------------------------------------
   Safely read API responses

   IMPORTANT:
   Never call response.json() directly here.
   Some successful backend endpoints return an empty body.
--------------------------------------------------------- */
async function safeReadResponse(response) {
  const text = await response.text();

  if (!text || !text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

/* ---------------------------------------------------------
   Date helper
--------------------------------------------------------- */
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ---------------------------------------------------------
   HR Notifications
--------------------------------------------------------- */
function HRNotifications() {
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const [error, setError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const [form, setForm] = useState({
    title: "",
    message: "",
    notification_type: "Public Holiday",
    event_date: "",
  });

  const monthName = today.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  /* -------------------------------------------------------
     Get authentication token every time
  ------------------------------------------------------- */
  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  /* -------------------------------------------------------
     Load calendar events
  ------------------------------------------------------- */
  const loadEvents = useCallback(async () => {
    setCalendarError("");

    try {
      const response = await fetch(`${HOLIDAY_API}/${year}/IN`);

      if (!response.ok) {
        throw new Error("Holiday calendar unavailable.");
      }

      const data = await safeReadResponse(response);

      const apiEvents = Array.isArray(data)
        ? data
            .map((item) => ({
              id: `${item.date}-${item.name}`,
              date: item.date,
              name: item.localName || item.name,
              description: item.name || "India public holiday",
              type: "Public Holiday",
            }))
            .filter((item) => {
              const date = new Date(`${item.date}T00:00:00`);

              return (
                date.getFullYear() === year &&
                date.getMonth() === month
              );
            })
        : [];

      const fallbackEvents = FALLBACK_EVENTS.filter((item) => {
        const date = new Date(`${item.date}T00:00:00`);

        return (
          date.getFullYear() === year &&
          date.getMonth() === month
        );
      }).map((item) => ({
        ...item,
        id: `${item.date}-${item.name}`,
        description: item.name,
      }));

      const combined = [...apiEvents];

      fallbackEvents.forEach((item) => {
        const exists = combined.some(
          (event) =>
            event.date === item.date &&
            event.name === item.name
        );

        if (!exists) {
          combined.push(item);
        }
      });

      combined.sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      setEvents(combined.slice(0, 12));
    } catch (err) {
      console.warn("Holiday API unavailable:", err);

      const fallback = FALLBACK_EVENTS.filter((item) => {
        const date = new Date(`${item.date}T00:00:00`);

        return (
          date.getFullYear() === year &&
          date.getMonth() === month
        );
      }).map((item) => ({
        ...item,
        id: `${item.date}-${item.name}`,
        description: item.name,
      }));

      setEvents(fallback);

      /*
        This is only a calendar warning.
        It must NOT appear as a notification publishing error.
      */
      setCalendarError(
        "Live holiday calendar is unavailable. Showing available local events."
      );
    }
  }, [year, month]);

  /* -------------------------------------------------------
     Load published notifications
  ------------------------------------------------------- */
  const loadNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("HR session expired. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await safeReadResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Unable to load notifications."
        );
      }

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      setNotifications(items);
    } catch (err) {
      console.error("Load HR notifications error:", err);

      setError(
        err?.message ||
          "Unable to load notifications."
      );
    }
  }, []);

  /* -------------------------------------------------------
     Initial load
  ------------------------------------------------------- */
  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("access_token");

    if (!token || role?.toLowerCase() !== "hr") {
      window.location.href = "/hr-login";
      return;
    }

    const loadPage = async () => {
      setLoading(true);

      await Promise.allSettled([
        loadEvents(),
        loadNotifications(),
      ]);

      setLoading(false);
    };

    loadPage();
  }, [loadEvents, loadNotifications]);

  /* -------------------------------------------------------
     Current month notifications
  ------------------------------------------------------- */
  const currentMonthNotifications = useMemo(() => {
    return notifications
      .filter((notification) => {
        if (!notification?.event_date) {
          return false;
        }

        const date = new Date(
          `${notification.event_date}T00:00:00`
        );

        return (
          date.getFullYear() === year &&
          date.getMonth() === month
        );
      })
      .sort((a, b) => {
        return String(b.event_date).localeCompare(
          String(a.event_date)
        );
      });
  }, [notifications, year, month]);

  /* -------------------------------------------------------
     Form change
  ------------------------------------------------------- */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    /*
      Remove old error as soon as HR starts editing.
    */
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /* -------------------------------------------------------
     Select calendar event
  ------------------------------------------------------- */
  const selectEvent = (event) => {
    setError("");
    setSuccess("");

    setForm({
      title: event.name,
      message: `Please note that ${event.name} will be observed on ${event.date}.`,
      notification_type:
        event.type === "Festival"
          ? "Festival"
          : "Public Holiday",
      event_date: event.date,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* -------------------------------------------------------
     Publish notification
  ------------------------------------------------------- */
  const createNotification = async (event) => {
    event.preventDefault();

    if (publishing) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("HR session expired. Please login again.");
      return;
    }

    /* Validate form */
    if (!form.title.trim()) {
      setError("Please enter a notification title.");
      return;
    }

    if (!form.message.trim()) {
      setError("Please enter a notification message.");
      return;
    }

    if (!form.event_date) {
      setError("Please select an event date.");
      return;
    }

    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/notifications/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title.trim(),
            message: form.message.trim(),
            notification_type:
              form.notification_type,
            event_date: form.event_date,
          }),
        }
      );

      /*
        IMPORTANT:

        Do NOT use:
          await response.json()

        because the backend may return an empty
        response body after successfully creating
        the notification.
      */
      const data = await safeReadResponse(response);

      /* Backend actually rejected the request */
      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to publish notification."
        );
      }

      /*
        HTTP 200/201/202/204 means the request succeeded.

        Even if the response body is empty,
        DO NOT show an error.
      */

      setSuccess(
        "Notification published successfully. It is now available in the employee dashboard and the email notification has been queued."
      );

      /* Reset form */
      setForm({
        title: "",
        message: "",
        notification_type: "Public Holiday",
        event_date: "",
      });

      /* Refresh published notification list */
      await loadNotifications();
    } catch (err) {
      console.error("Publish notification error:", err);

      setSuccess("");

      setError(
        err?.message ||
          "Unable to publish notification."
      );
    } finally {
      setPublishing(false);
    }
  };

  /* -------------------------------------------------------
     Refresh everything
  ------------------------------------------------------- */
  const refreshPage = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    await Promise.allSettled([
      loadEvents(),
      loadNotifications(),
    ]);

    setLoading(false);
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <main className="dashboard-main hr-calendar-page">

      {/* PAGE HEADER */}
      <div className="hr-calendar-toolbar">

        <div className="page-heading">
          <span className="eyebrow">
            ORGANIZATION
          </span>

          <h1>Notifications</h1>

          <p>
            Create employee announcements and manage
            important holidays and events.
          </p>
        </div>

        <button
          className="calendar-btn"
          type="button"
          onClick={refreshPage}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>

      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="notification-success">
          <span className="notification-alert-icon">
            ✓
          </span>

          <div>
            <strong>Published</strong>
            <p>{success}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* API ERROR */}
      {error && (
        <div className="notification-error">
          <span className="notification-alert-icon">
            !
          </span>

          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* CALENDAR WARNING */}
      {calendarError && (
        <div className="notification-warning">
          <span>ⓘ</span>

          <p>{calendarError}</p>

          <button
            type="button"
            onClick={() => setCalendarError("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="hr-notification-layout">

        {/* CREATE NOTIFICATION */}
        <section className="calendar-card hr-create-card">

          <div className="calendar-card-header">

            <span className="eyebrow">
              PUBLISH
            </span>

            <h2>
              Create Notification
            </h2>

            <p>
              Everything published here will appear
              in the employee notification dashboard.
            </p>

          </div>

          <form
            className="notification-form"
            onSubmit={createNotification}
          >

            {/* TITLE */}
            <div className="form-group">
              <label htmlFor="notification-title">
                Notification Title
              </label>

              <input
                id="notification-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Ganesh Chaturthi Holiday"
                maxLength={200}
                required
              />
            </div>

            {/* TYPE */}
            <div className="form-row">

              <div className="form-group">
                <label htmlFor="notification-type">
                  Notification Type
                </label>

                <select
                  id="notification-type"
                  name="notification_type"
                  value={form.notification_type}
                  onChange={handleChange}
                >
                  <option value="Public Holiday">
                    Public Holiday
                  </option>

                  <option value="Festival">
                    Festival
                  </option>

                  <option value="Announcement">
                    Announcement
                  </option>

                  <option value="Birthday">
                    Birthday
                  </option>
                </select>
              </div>

              {/* DATE */}
              <div className="form-group">
                <label htmlFor="notification-date">
                  Event Date
                </label>

                <input
                  id="notification-date"
                  name="event_date"
                  type="date"
                  value={form.event_date}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* MESSAGE */}
            <div className="form-group">
              <label htmlFor="notification-message">
                Message
              </label>

              <textarea
                id="notification-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write the message employees should see..."
                rows={7}
                maxLength={2000}
                required
              />

              <span className="character-count">
                {form.message.length}/2000
              </span>
            </div>

            {/* SUBMIT */}
            <button
              className="notification-submit"
              type="submit"
              disabled={publishing}
            >
              {publishing
                ? "Publishing..."
                : "Publish Notification"}
            </button>

          </form>

        </section>

        {/* CALENDAR */}
        <section className="calendar-card hr-month-events-card">

          <div className="calendar-card-header month-events-heading">

            <div>
              <span className="eyebrow">
                CALENDAR
              </span>

              <h2>
                Festivals &amp; Holidays
              </h2>

              <p>
                {monthName} · Select an event to
                prepare a notification.
              </p>
            </div>

            <span className="month-event-count">
              {events.length}
            </span>

          </div>

          {loading ? (
            <div className="calendar-empty">
              Loading this month&apos;s events...
            </div>
          ) : events.length === 0 ? (
            <div className="calendar-empty">
              No festivals or public holidays found
              for this month.
            </div>
          ) : (
            <div className="month-events-grid">

              {events.map((event) => {

                const date = new Date(
                  `${event.date}T00:00:00`
                );

                return (
                  <button
                    className="month-event-tile"
                    type="button"
                    key={event.id}
                    onClick={() =>
                      selectEvent(event)
                    }
                  >

                    <div className="event-date-box">
                      <span className="month-event-day">
                        {date.getDate()}
                      </span>

                      <span className="month-event-weekday">
                        {date.toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "short",
                          }
                        )}
                      </span>
                    </div>

                    <div className="month-event-info">

                      <strong>
                        {event.name}
                      </strong>

                      <small>
                        {event.type}
                      </small>

                    </div>

                    <span className="event-arrow">
                      →
                    </span>

                  </button>
                );
              })}

            </div>
          )}

        </section>

      </div>

      {/* PUBLISHED NOTIFICATIONS */}
      <section className="calendar-card current-month-notifications">

        <div className="calendar-card-header month-events-heading">

          <div>
            <span className="eyebrow">
              PUBLISHED
            </span>

            <h2>
              This Month&apos;s Notifications
            </h2>

            <p>
              Notifications currently visible to employees.
            </p>
          </div>

          <span className="month-event-count">
            {currentMonthNotifications.length}
          </span>

        </div>

        {currentMonthNotifications.length === 0 ? (

          <div className="calendar-empty">
            <div className="empty-icon">
              ◇
            </div>

            <strong>
              No notifications published
            </strong>

            <p>
              Published notifications will appear
              here.
            </p>
          </div>

        ) : (

          <div className="hr-published-notification-list">

            {currentMonthNotifications.map(
              (notification) => (

                <article
                  className="hr-published-notification"
                  key={notification.id}
                >

                  <div className="published-notification-main">

                    <div className="published-notification-top">

                      <span
                        className={`notification-type-badge ${String(
                          notification.notification_type ||
                            "Announcement"
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {notification.notification_type ||
                          "Announcement"}
                      </span>

                      <time>
                        {formatDate(
                          notification.event_date
                        )}
                      </time>

                    </div>

                    <h3>
                      {notification.title ||
                        "Notification"}
                    </h3>

                    <p>
                      {notification.message ||
                        "No message available."}
                    </p>

                  </div>

                  <div className="published-status">
                    <span className="published-dot"></span>
                    Published
                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default HRNotifications;