# HRM Frontend Fixes — September 22, 2026

## What was fixed

### CSS structure
- Each React page imports its own page CSS file.
- HR and Employee layouts import their own layout CSS files.
- Removed the old `App.css` CSS aggregator from the application entry point.
- Kept `css/shared.css` for reusable/global shell, form, table, modal and common dashboard styles.
- Added missing `HRLeaveDetails.css` and imported it from `HRLeaveDetails.jsx`.
- Added consistent page/card/form spacing and responsive padding.
- Removed the invalid legacy `App.original.css` from `src/` because it contained a known stray `Z` CSS syntax error; the legacy copy is retained under `legacy/`.

### HR notifications
- HR notification dropdown is now properly styled.
- Leave Requests opens `/hr-leaves`.
- Work Reports opens `/hr-work-reports`.
- Employees opens `/employees`.
- View all opens `/hr-notifications`.
- Dropdown closes when clicking outside.
- Dropdown closes with Escape.

### Employee notifications
- Corrected all old `/notifications` navigation paths to `/employee-notifications`.
- Employee notification list accepts both array responses and `{ notifications: [...] }` API responses.
- Employee unread badge is updated after notification reads.
- Notification popup closes when clicking outside or pressing Escape.
- View notification navigates to the actual employee notification page.

### Routing
- Added the missing HR leave detail route:
  `/hr-leaves/:leaveId`

### Code quality
- Fixed invalid CSS/JSX import structure.
- Moved pagination logic into `hooks/usePagination.js` so the pagination component is a pure component.
- Fixed employee leave and employee list function-hoisting lint errors.
- ESLint now reports **0 errors**; only existing React Hook dependency warnings remain.

## Validation

- JSX/JS parser check: **0 syntax errors**
- CSS/PostCSS parser check: **0 syntax errors**
- ESLint: **0 errors, 8 warnings**

The uploaded `node_modules` contained a platform-specific Rolldown native binding that is not usable in this Linux validation environment. The ZIP therefore intentionally excludes `node_modules`; your Windows project should keep its existing Windows `node_modules`.
