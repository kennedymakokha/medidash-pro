import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HospitalDataProvider } from "@/contexts/HospitalDataContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Vitals from "./pages/Vitals";
import NotFound from "./pages/NotFound";
import { store } from "./store";
import { Provider } from 'react-redux';
import DepartmentsPage from "./pages/Departments";
import PatientsPage from "./pages/Patients";
import AppointmentsPage from "./pages/Appointments";
import StaffPage from "./pages/Staff";
import BedsPage from "./pages/Beds";
import ReportsPage from "./pages/Reports";
import PatientCarePage from "./pages/PatientCare";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <AuthProvider>
        <HospitalDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/patient-care" element={<PatientCarePage />} />
                <Route path="/vitals" element={<Vitals />} />
                <Route path="/beds" element={<BedsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HospitalDataProvider>
      </AuthProvider>
    </Provider>
  </QueryClientProvider>
);

export default App;
