import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==============================
// AUTH / PORTAL
// ==============================
import PortalSelection from "./pages/PortalSelection";
import HRLogin from "./pages/HRLogin";
import EmployeeLogin from "./pages/EmployeeLogin";

// ==============================
// HR PAGES
// ==============================
import HRDashboard from "./pages/HRDashboard";
import Employees from "./pages/Employees";
import HREmployeeDetails from "./pages/HREmployeeDetails";
import HRWorkReports from "./pages/HRWorkReports";
import HRLeaves from "./pages/HRLeaves";
import HRLeaveDetails from "./pages/HRLeaveDetails";
import HRProjects from "./pages/HRProjects";
import HRProjectDetails from "./pages/HRProjectDetails";
import HRPerformance from "./pages/HRPerformance";
import HRNotifications from "./pages/HRNotifications";
import HRSetting from "./pages/HRSetting";
import HRProfile from "./pages/HRProfile";

// ==============================
// EMPLOYEE PAGES
// ==============================
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeWorkReports from "./pages/EmployeeWorkReports";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import EmployeeProjects from "./pages/EmployeeProjects";
import EmployeeProjectDetails from "./pages/EmployeeProjectDetails";
import EmployeePerformance from "./pages/EmployeePerformance";
import EmployeeNotifications from "./pages/EmployeeNotifications";
import EmployeeNotificationDetails from "./pages/EmployeeNotificationDetails";

// ==============================
// LAYOUTS
// ==============================
import HRLayout from "./layouts/HrLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            PUBLIC / LOGIN ROUTES
        ===================================================== */}
        <Route path="/" element={<PortalSelection />} />
        <Route path="/hr-login" element={<HRLogin />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />

        {/* =====================================================
            HR ROUTES
        ===================================================== */}
        <Route element={<HRLayout />}>
          <Route path="/hr-dashboard" element={<HRDashboard />} />

          <Route path="/employees" element={<Employees />} />

          {/* Click an employee name -> employee profile */}
          <Route
            path="/employees/:id"
            element={<HREmployeeDetails />}
          />

          <Route path="/hr-work-reports" element={<HRWorkReports />} />

          <Route path="/hr-leaves" element={<HRLeaves />} />

          <Route
            path="/hr-leaves/:leaveId"
            element={<HRLeaveDetails />}
          />

          <Route path="/hr-projects" element={<HRProjects />} />

          <Route
            path="/hr-projects/:projectId"
            element={<HRProjectDetails />}
          />

          <Route path="/hr-performance" element={<HRPerformance />} />

          <Route
            path="/hr-notifications"
            element={<HRNotifications />}
          />

          <Route path="/hr-settings" element={<HRSetting />} />

          <Route path="/hr-profile" element={<HRProfile />} />
        </Route>

        {/* =====================================================
            EMPLOYEE ROUTES
        ===================================================== */}
        <Route element={<EmployeeLayout />}>
          <Route
            path="/employee-dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
            path="/employee-profile"
            element={<EmployeeProfile />}
          />

          <Route
            path="/employee-work-reports"
            element={<EmployeeWorkReports />}
          />

          <Route
            path="/employee-leaves"
            element={<EmployeeLeaves />}
          />

          <Route
            path="/employee-projects"
            element={<EmployeeProjects />}
          />

          <Route
            path="/employee-projects/:id"
            element={<EmployeeProjectDetails />}
          />

          <Route
            path="/employee-performance"
            element={<EmployeePerformance />}
          />

          <Route
            path="/employee-notifications"
            element={<EmployeeNotifications />}
          />

          <Route
            path="/employee-notifications/:id"
            element={<EmployeeNotificationDetails />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
