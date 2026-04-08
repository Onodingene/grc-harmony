import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/demo" element={<Demo />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/consolidated" element={<Consolidated />} />
            <Route path="/controls" element={<Controls />} />
            <Route path="/test-plan" element={<TestPlan />} />
            <Route path="/testing" element={<Testing />} />
            <Route path="/monthly-report" element={<MonthlyReport />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
