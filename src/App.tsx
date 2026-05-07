import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Consolidated from "./pages/Consolidated";
import Controls from "./pages/Controls";
import TestPlan from "./pages/TestPlan";
import Testing from "./pages/Testing";
import MonthlyReport from "./pages/MonthlyReport";
import Issues from "./pages/Issues";
import Actions from "./pages/Actions";
import Audit from "./pages/Audit";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import Billing from "./pages/Billing";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteRegistration from "./pages/CompleteRegistration";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { setReady } = useAuthStore();

  useEffect(() => {
    setReady();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/complete-registration" element={<CompleteRegistration />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute path="/dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consolidated"
          element={
            <ProtectedRoute path="/consolidated">
              <Consolidated />
            </ProtectedRoute>
          }
        />
        <Route
          path="/controls"
          element={
            <ProtectedRoute path="/controls">
              <Controls />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-plan"
          element={
            <ProtectedRoute path="/test-plan">
              <TestPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/testing"
          element={
            <ProtectedRoute path="/testing">
              <Testing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monthly-report"
          element={
            <ProtectedRoute path="/monthly-report">
              <MonthlyReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issues"
          element={
            <ProtectedRoute path="/issues">
              <Issues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/actions"
          element={
            <ProtectedRoute path="/actions">
              <Actions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute path="/audit">
              <Audit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute path="/calendar">
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute path="/settings">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute path="/profile">
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
