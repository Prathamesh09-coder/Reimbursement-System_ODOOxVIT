import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import ExpenseListPage from "@/pages/ExpenseListPage";
import AddExpensePage from "@/pages/AddExpensePage";
import ExpenseDetailPage from "@/pages/ExpenseDetailPage";
import ApprovalsPage from "@/pages/ApprovalsPage";
import UsersPage from "@/pages/UsersPage";
import WorkflowsPage from "@/pages/WorkflowsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isAdmin = user?.role === "admin";
  const canApprove = ["admin", "manager", "finance", "director"].includes(user?.role || "");

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpenseListPage />} />
        <Route path="/expenses/new" element={<AddExpensePage />} />
        <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
        {canApprove && <Route path="/approvals" element={<ApprovalsPage />} />}
        {isAdmin && <Route path="/users" element={<UsersPage />} />}
        {isAdmin && <Route path="/workflows" element={<WorkflowsPage />} />}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const AuthRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated ? <ProtectedRoutes /> : <AuthRoutes />}
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
