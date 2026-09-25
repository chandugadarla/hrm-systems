import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "../css/EmployeeNotifications.css";

const API_URL = "http://127.0.0.1:8000";

const getReadKey = () => {
  const employeeId =
    localStorage.getItem("employee_id");

  return employeeId
    ? `hrm_read_notifications_${employeeId}`
    : "hrm_read_notifications";
};

const getReadIds = () => {
  try {
    const value = localStorage.getItem(
      getReadKey()
    );

    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
};

const saveReadIds = (ids) => {
  localStorage.setItem(
    getReadKey(),
    JSON.stringify([
      ...new Set(ids.map(String)),
    ])
  );
};

function EmployeeNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [readIds, setReadIds] =
    useState(getReadIds());

  // =====================================================
  // FETCH FROM BACKEND
  // =====================================================

  const fetchNotifications = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "access_token"
          );

        const role =
          localStorage.getItem("role");

        if (!token || role !== "employee") {
          navigate("/employee-login");
          return;
        }

        const response = await fetch(
          `${API_URL}/notifications/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const text =
          await response.text();

        let data = [];

        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error(
              "The server returned invalid notification data."
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load notifications."
          );
        }

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.notifications)
          ? data.notifications
          : [];

        setNotifications(items);

        // Keep cache only as a backup for detail page.
        localStorage.setItem(
          "employee_notifications_cache",
          JSON.stringify(items)
        );

      } catch (err) {
        console.error(
          "Employee notifications:",
          err
        );

        setError(
          err.message ||
            "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchNotifications();

    // Refresh automatically.
    const interval = setInterval(
      fetchNotifications,
      15000
    );

    return () => {
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // =====================================================
  // READ STATE
  // =====================================================

  useEffect(() => {
    const updateReadState = () => {
      setReadIds(getReadIds());
    };

    window.addEventListener(
      "hrm-notifications-updated",
      updateReadState
    );

    window.addEventListener(
      "employee-notification-read",
      updateReadState
    );

    return () => {
      window.removeEventListener(
        "hrm-notifications-updated",
        updateReadState
      );

      window.removeEventListener(
        "employee-notification-read",
        updateReadState
      );
    };
  }, []);

  // =====================================================
  // TYPE
  // =====================================================

  const getTypeClass = (type) => {
    const value = (
      type || ""
    ).toLowerCase();

    if (value.includes("holiday")) {
      return "holiday";
    }

    if (value.includes("festival")) {
      return "festival";
    }

    return "announcement";
  };

  const getTypeLabel = (type) => {
    const value = (
      type || ""
    ).toLowerCase();

    if (value.includes("holiday")) {
      return "Public Holiday";
    }

    if (value.includes("festival")) {
      return "Festival";
    }

    return "Announcement";
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(
      `${dateString}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // UNREAD
  // =====================================================

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !readIds.includes(
          String(notification.id)
        )
    ).length;
  }, [notifications, readIds]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredNotifications =
    useMemo(() => {
      if (filter === "all") {
        return notifications;
      }

      return notifications.filter(
        (notification) => {
          const type = (
            notification.notification_type ||
            ""
          ).toLowerCase();

          if (
            filter === "holiday"
          ) {
            return type.includes(
              "holiday"
            );
          }

          if (
            filter === "festival"
          ) {
            return type.includes(
              "festival"
            );
          }

          if (
            filter === "announcement"
          ) {
            return (
              !type.includes("holiday") &&
              !type.includes("festival")
            );
          }

          return true;
        }
      );
    }, [notifications, filter]);

  // =====================================================
  // MARK READ
  // =====================================================

  const markAsRead = (id) => {
    const stringId = String(id);

    const updated = [
      ...readIds,
      stringId,
    ];

    saveReadIds(updated);

    setReadIds([
      ...new Set(updated),
    ]);

    window.dispatchEvent(
      new CustomEvent(
        "hrm-notifications-updated"
      )
    );
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = () => {
    const allIds =
      notifications.map(
        (notification) =>
          String(notification.id)
      );

    saveReadIds(allIds);

    setReadIds(allIds);

    window.dispatchEvent(
      new CustomEvent(
        "hrm-notifications-updated"
      )
    );
  };

  // =====================================================
  // OPEN
  // =====================================================

  const openNotification = (
    notification
  ) => {
    if (!notification?.id) {
      return;
    }

    markAsRead(notification.id);

    sessionStorage.setItem(
      "selected_employee_notification",
      JSON.stringify(notification)
    );

    navigate(
      `/employee-notifications/${notification.id}`,
      {
        state: {
          notification,
        },
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="dashboard-main employee-notifications-page">

      {/* HEADER */}
      <div className="dashboard-heading">

        <div>
          <span className="page-eyebrow">
            ORGANIZATION
          </span>

          <h1>Notifications</h1>

          <p>
            Important announcements, public
            holidays and festivals from HR.
          </p>
        </div>

        <button
          className="date-button"
          type="button"
          onClick={fetchNotifications}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* SUMMARY */}
      <div className="employee-notification-toolbar">

        <div className="notification-summary">
          <strong>
            {unreadCount}
          </strong>

          <span>
            unread notification
            {unreadCount !== 1
              ? "s"
              : ""}
          </span>
        </div>

        <button
          type="button"
          className="mark-all-read-button"
          onClick={markAllAsRead}
          disabled={
            unreadCount === 0
          }
        >
          ✓ Mark all as read
        </button>

      </div>

      {/* FILTERS */}
      <div className="employee-notification-filters">

        <button
          type="button"
          className={
            filter === "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("all")
          }
        >
          All
        </button>

        <button
          type="button"
          className={
            filter === "holiday"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("holiday")
          }
        >
          Public Holidays
        </button>

        <button
          type="button"
          className={
            filter === "festival"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("festival")
          }
        >
          Festivals
        </button>

        <button
          type="button"
          className={
            filter === "announcement"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("announcement")
          }
        >
          Announcements
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="dashboard-error">

          <h2>
            Unable to load notifications
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={
              fetchNotifications
            }
          >
            Try Again
          </button>

        </div>
      )}

      {/* LOADING */}
      {!error && loading && (
        <div className="dashboard-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading your notifications...
          </p>

        </div>
      )}

      {/* EMPTY */}
      {!error &&
        !loading &&
        filteredNotifications.length ===
          0 && (
          <section className="dashboard-panel employee-notifications-empty">

            <div className="employee-notification-empty-icon">
              ◇
            </div>

            <h2>
              No notifications
            </h2>

            <p>
              {notifications.length ===  0 
                ? "There are no notifications from HR at the moment."
                : "There are no notifications in this category."}
            </p>

          </section>
        )}

      {/* LIST */}
      {!error &&
        !loading &&
        filteredNotifications.length >
          0 && (

          <section className="employee-notification-list">

            {filteredNotifications.map(
              (notification) => {

                const isRead =
                  readIds.includes(
                    String(
                      notification.id
                    )
                  );

                return (
                  <article
                    key={notification.id}
                    className={`dashboard-panel employee-notification-card ${
                      isRead
                        ? "employee-notification-read"
                        : "employee-notification-unread"
                    }`}
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {

                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {

                        event.preventDefault();

                        openNotification(
                          notification
                        );
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >

                    <div className="employee-notification-card-top">

                      <div className="employee-notification-title">

                        <div className="employee-notification-type-row">

                          <span
                            className={`employee-notification-type ${getTypeClass(
                              notification.notification_type
                            )}`}
                          >
                            {getTypeLabel(
                              notification.notification_type
                            )}
                          </span>

                          {!isRead && (
                            <span className="employee-notification-unread-badge">
                              NEW
                            </span>
                          )}

                        </div>

                        <h2>
                          {notification.title ||
                            "Notification"}
                        </h2>

                      </div>

                      <time>
                        {formatDate(
                          notification.event_date
                        )}
                      </time>

                    </div>

                    <p className="employee-notification-message">
                      {notification.message ||
                        "No message available."}
                    </p>

                    <div className="employee-notification-footer">

                      <span>
                        {isRead
                          ? "Read"
                          : "Unread"}
                      </span>

                      <span className="employee-notification-view">
                        View details →
                      </span>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

    </main>
  );
}

export default EmployeeNotifications;