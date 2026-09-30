import "../css/EmployeeLayout.css";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const getReadStorageKey = () => {
  const employeeId = localStorage.getItem("employee_id");

  return employeeId
    ? `hrm_read_notifications_${employeeId}`
    : null;
};

const getReadIds = () => {
  const key = getReadStorageKey();

  if (!key) return [];

  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(value)
      ? value.map(String)
      : [];
  } catch {
    return [];
  }
};

const saveReadIds = (ids) => {
  const key = getReadStorageKey();

  if (!key) return;

  localStorage.setItem(
    key,
    JSON.stringify([...new Set(ids.map(String))])
  );

  window.dispatchEvent(
    new CustomEvent("hrm-notifications-updated")
  );
};

function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [popupNotification, setPopupNotification] =
    useState(null);

  const [popupVisible, setPopupVisible] =
    useState(false);

  const popupRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path;

  /*
   * Calculate unread count ONLY from notifications
   * which are not in the employee's read list.
   */
  const calculateUnread = useCallback((items) => {
    const readIds = getReadIds();

    const unread = items.filter(
      (item) =>
        !readIds.includes(String(item.id))
    );

    setUnreadCount(unread.length);

    return unread;
  }, []);

  const fetchNotifications = useCallback(
    async (showPopup = false) => {
      const token =
        localStorage.getItem("access_token");

      const role =
        localStorage.getItem("role");

      if (!token || role !== "employee") {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/notifications/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.notifications)
          ? data.notifications
          : [];

        const unread =
          calculateUnread(items);

        /*
         * Show popup only for an unread notification
         * that hasn't already been displayed as a popup.
         */
        if (
          showPopup &&
          unread.length > 0
        ) {
          const employeeId =
            localStorage.getItem(
              "employee_id"
            );

          const popupKey =
            `hrm_popup_notifications_${employeeId}`;

          let popupSeen = [];

          try {
            popupSeen = JSON.parse(
              localStorage.getItem(
                popupKey
              ) || "[]"
            );
          } catch {
            popupSeen = [];
          }

          const newUnread =
            unread.find(
              (item) =>
                !popupSeen.includes(
                  String(item.id)
                )
            );

          if (newUnread) {
            setPopupNotification(
              newUnread
            );

            setPopupVisible(true);

            localStorage.setItem(
              popupKey,
              JSON.stringify([
                ...popupSeen,
                String(newUnread.id),
              ])
            );
          }
        }
      } catch (error) {
        console.error(
          "Notification polling error:",
          error
        );
      }
    },
    [calculateUnread]
  );

  /*
   * Mark ONE notification as read.
   */
  const markAsRead = useCallback(
    (notificationId) => {
      const id =
        String(notificationId);

      const readIds =
        getReadIds();

      if (!readIds.includes(id)) {
        const updatedIds = [
          ...readIds,
          id,
        ];

        saveReadIds(updatedIds);

        setUnreadCount(
          (count) =>
            Math.max(0, count - 1)
        );
      }

      setPopupVisible(false);
      setPopupNotification(null);
    },
    []
  );

  /*
   * Open the actual notification detail page.
   */
  const openNotification = (
    notification
  ) => {
    if (!notification?.id) {
      return;
    }

    const notificationId =
      String(notification.id);

    markAsRead(notificationId);

    sessionStorage.setItem(
      "selected_employee_notification",
      JSON.stringify(notification)
    );

    navigate(
      `/employee-notifications/${notificationId}`,
      {
        state: {
          notification,
        },
      }
    );
  };

  /*
   * Close popup when clicking outside.
   */
  useEffect(() => {
    if (!popupVisible) {
      return undefined;
    }

    const handleOutsideClick = (
      event
    ) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(
          event.target
        )
      ) {
        setPopupVisible(false);
        setPopupNotification(null);
      }
    };

    const handleEscape = (
      event
    ) => {
      if (event.key === "Escape") {
        setPopupVisible(false);
        setPopupNotification(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [popupVisible]);

  /*
   * Poll notifications every 15 seconds.
   */
  useEffect(() => {
    fetchNotifications(true);

    const interval =
      setInterval(() => {
        fetchNotifications(true);
      }, 15000);

    const handleNotificationUpdate =
      () => {
        fetchNotifications(false);
      };

    window.addEventListener(
      "hrm-notifications-updated",
      handleNotificationUpdate
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "hrm-notifications-updated",
        handleNotificationUpdate
      );
    };
  }, [fetchNotifications]);

  /*
   * Recalculate whenever the employee returns
   * to the notifications page.
   */
  useEffect(() => {
    fetchNotifications(false);
  }, [
    location.pathname,
    fetchNotifications,
  ]);

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "employee_id"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/");
  };

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            H
          </div>

          <div>
            <strong>HRM</strong>
            <span>
              Employee Portal
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <div className="nav-section-title">
            WORKSPACE
          </div>

          <button
            type="button"
            className={`nav-item ${
              isActive(
                "/employee-dashboard"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/employee-dashboard"
              )
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            type="button"
            className={`nav-item ${
              isActive(
                "/employee-profile"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/employee-profile"
              )
            }
          >
            <span>♙</span>
            My Profile
          </button>

          <button
            type="button"
            className={`nav-item ${
              isActive(
                "/employee-work-reports"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/employee-work-reports"
              )
            }
          >
            <span>▤</span>
            Work Reports
          </button>

          <button
            type="button"
            className={`nav-item ${
              isActive(
                "/employee-leaves"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/employee-leaves"
              )
            }
          >
            <span>◷</span>
            Leave Management
          </button>

          <button
            type="button"
            className={`nav-item ${
              isActive(
                "/employee-projects"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/employee-projects"
              )
            }
          >
            <span>□</span>
            My Projects
          </button>

          <button
            type="button"
            className={`nav-item ${
              isActive(
                "/employee-performance"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/employee-performance"
              )
            }
          >
            <span>↗</span>
            Performance
          </button>

          <div className="nav-section-title second">
            ORGANIZATION
          </div>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            className={`nav-item notification-nav-item ${
              isActive(
                "/employee-notifications"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/employee-notifications"
              )
            }
          >
            <span className="notification-nav-icon">
              ◇
            </span>

            <span className="notification-nav-label">
              Notifications
            </span>

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="nav-item logout-item"
            onClick={logout}
          >
            <span>↪</span>
            Sign out
          </button>

        </div>

      </aside>

      {/* CONTENT */}
      <div className="dashboard-content employee-dashboard-content">

        <header className="dashboard-topbar employee-static-topbar">

          <div className="dashboard-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search your workspace..."
              disabled
            />
          </div>

          <div className="topbar-actions">

            {/* HEADER NOTIFICATION BUTTON */}
            <button
              type="button"
              className="notification-button notification-button-with-badge"
              onClick={() =>
                navigate(
                  "/employee-notifications"
                )
              }
              title={
                unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "Notifications"
              }
            >
              ♧

              {unreadCount > 0 && (
                <span className="topbar-notification-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            <div className="profile-wrapper">

              <button
                type="button"
                className="profile profile-button"
                onClick={() =>
                  setProfileOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-expanded={
                  profileOpen
                }
              >
                <div className="profile-avatar">
                  EM
                </div>

                <div className="profile-info">
                  <strong>
                    Employee
                  </strong>

                  <span>
                    Employee Portal
                  </span>
                </div>

                <span className="profile-arrow">
                  {profileOpen
                    ? "⌃"
                    : "⌄"}
                </span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileOpen(
                        false
                      );

                      navigate(
                        "/employee-profile"
                      );
                    }}
                  >
                    <span>♙</span>
                    My Profile
                  </button>

                  <button
                    type="button"
                    className="profile-logout"
                    onClick={logout}
                  >
                    <span>↪</span>
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        <Outlet />

      </div>

      {/* POPUP */}
      {popupVisible &&
        popupNotification && (
          <div
            className="notification-popup"
            role="status"
            ref={popupRef}
          >

            <button
              type="button"
              className="notification-popup-close"
              aria-label="Close notification"
              onClick={() => {
                setPopupVisible(false);
                setPopupNotification(null);
              }}
            >
              ×
            </button>

            <div className="notification-popup-icon">
              ◇
            </div>

            <div className="notification-popup-content">

              <span className="notification-popup-label">
                NEW NOTIFICATION
              </span>

              <strong>
                {popupNotification.title}
              </strong>

              <p>
                {popupNotification.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  openNotification(
                    popupNotification
                  )
                }
              >
                View notification
              </button>

            </div>

          </div>
        )}

    </div>
  );
}

export default EmployeeLayout;
