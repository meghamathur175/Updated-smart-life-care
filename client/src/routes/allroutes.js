import React from "react";
import { Route, Routes } from "react-router-dom";

// Patient Pages
import LandingPage from "../pages/Landing";
import SignIn from "../pages/SignIn";
import ForgotPassword from "../pages/ForgotPassword";
import SignUp from "../pages/SignUp";
import ResetPassword from "../pages/ResetPassword";
import TrackAmbulancePage from "../pages/TrackAmbulancePage";
import RequestAmbulance from "../pages/RequestAmbulance";
import NearbyHospitals from '../pages/NearbyHospitals';

// Partner Dashboard
import PartnerSidebar from "../components/PartnerDashboardSidebar";
import Request from "../pages2/Request";
import Tracking from "../pages2/Tracking"; 
import Reports from "../pages2/Reports";
import PaymentHistory from "../pages2/PaymentHistory";

// Admin Dashboard
import AdminSidebar from "../components/AdminDashboardSidebar";
import PartnerOnboardingAndCommission from "../pages3/PartnerOnboardingAndCommission";
import CommissionManagement from "../pages3/CommissionManagement";
import AdminReports from "../pages3/AdminReports";

const AllRoutes = () => {
  return (
    <Routes>
      {/* Public & Patient Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/resetPassword/:token" element={<ResetPassword />} />
      <Route path="/request-ambulance" element={<RequestAmbulance />} />
      <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
      <Route path="/track-ambulance" element={<TrackAmbulancePage />} />

      {/* Partner Dashboard with Sidebar Layout */}
      <Route path="/partner-dashboard" element={<PartnerSidebar />}>
        <Route path="requests" element={<Request />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="reports" element={<Reports />} />
        <Route path="payments" element={<PaymentHistory />} />
      </Route>

      <Route path="/admin-dashboard" element={<AdminSidebar/>}>
        <Route path="partner-onbording" element={<PartnerOnboardingAndCommission />} />
        <Route path="commission-management" element={<CommissionManagement />} />
        <Route path="admin-reports" element={<AdminReports />} />
      </Route>
    </Routes>
  );
};

export default AllRoutes;
