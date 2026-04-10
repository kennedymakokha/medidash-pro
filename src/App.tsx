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
import { Provider } from "react-redux";
import DepartmentsPage from "./pages/Departments";
import PatientsPage from "./pages/Patients";
import AppointmentsPage from "./pages/Appointments";
import StaffPage from "./pages/Staff";
import BedsPage from "./pages/Beds";
import ReportsPage from "./pages/Reports";
import PatientCarePage from "./pages/PatientCare";
import ConsultationsPage from "./pages/Consultations";
import LabTestsPage from "./pages/LabTests";
import FinancePage from "./pages/Finance";
import LabOrdersPage from "./pages/LabOrders";
import PharmacyPage from "./pages/Pharmacy";
import AssignBedPage from "./pages/AssignBed";
import DispensePage from "./pages/Dispense";
import { ChatWidget } from "./components/chat/ChatWidget";
import PatientDetailsPage from "./pages/patientsDetails";
import VisitReportPage from "./pages/visitDetails";
import { SocketProvider } from "./contexts/SocketContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
        <HospitalDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/:id" element={<PatientDetailsPage />} />
                <Route path="/visits/:id" element={<VisitReportPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/patient-care" element={<PatientCarePage />} />
                <Route path="/vitals" element={<Vitals />} />
                <Route path="/beds" element={<BedsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/consultations" element={<ConsultationsPage />} />
                <Route path="/lab-tests" element={<LabTestsPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/lab-orders" element={<LabOrdersPage />} />
                <Route path="/pharmacy" element={<PharmacyPage />} />
                <Route path="/assign-bed" element={<AssignBedPage />} />
                <Route path="/dispense" element={<DispensePage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatWidget />
            </BrowserRouter>
          </TooltipProvider>
        </HospitalDataProvider>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  </QueryClientProvider>
);

export default App;
