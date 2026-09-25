# HRM Frontend CSS Structure

The frontend uses **one page/layout CSS file per React page or layout**.

Examples:
- `pages/Employees.jsx` → `css/Employees.css`
- `pages/HRNotifications.jsx` → `css/HRNotifications.css`
- `pages/EmployeeNotifications.jsx` → `css/EmployeeNotifications.css`
- `layouts/HrLayout.jsx` → `css/HrLayout.css`
- `layouts/EmployeeLayout.jsx` → `css/EmployeeLayout.css`

`css/shared.css` contains only reusable/global layout primitives, form controls, tables, modal utilities, and shared dashboard elements.

`App.css` is no longer used as a CSS aggregator. This prevents changes to one page from unexpectedly changing every other page.

## Notification navigation

HR top-bar notification items navigate to:
- Leave requests → `/hr-leaves`
- Work reports → `/hr-work-reports`
- Employees → `/employees`
- View all → `/hr-notifications`

Employee notifications use `/employee-notifications` consistently.

The HR notification dropdown supports outside-click and Escape-key dismissal. Employee notification popups also dismiss on outside-click or Escape.
