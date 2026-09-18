import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PayrollProvider, usePayroll } from './context/PayrollContext';
import { Shell } from './components/layout/Shell';
import { ToastContainer } from './components/common/ToastContainer';
import { PayslipModal } from './components/payroll/PayslipModal';
import { LoginPage } from './pages/LoginPage';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { AttendancePage } from './pages/AttendancePage';
import { TimeOffPage } from './pages/TimeOffPage';
import { PayRunsPage } from './pages/PayRunsPage';
import { PayslipsPage } from './pages/PayslipsPage';
import { SalaryRulesPage } from './pages/SalaryRulesPage';
import { ReportsPage } from './pages/ReportsPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { activeView, selectedEmployeeId, setActiveView } = usePayroll();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center text-xs text-[#5F6773]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
          <span>Verifying authentication & SQLite database connection...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPage />;

      case 'employees':
        return <EmployeesPage />;

      case 'employee-detail':
        return (
          <EmployeeDetailPage
            employeeId={selectedEmployeeId || 'EMP-1001'}
            onBack={() => setActiveView('employees')}
          />
        );

      case 'attendance':
        return <AttendancePage />;

      case 'timeoff':
        return <TimeOffPage />;

      case 'payruns':
        return <PayRunsPage />;

      case 'payslips':
        return <PayslipsPage />;

      case 'salary-rules':
        return <SalaryRulesPage />;

      case 'reports':
        return <ReportsPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <Shell>
      {renderActiveView()}
      <PayslipModal />
      <ToastContainer />
    </Shell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PayrollProvider>
        <AppContent />
      </PayrollProvider>
    </AuthProvider>
  );
}
