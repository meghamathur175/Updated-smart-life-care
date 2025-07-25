import React from "react";
import { Route, Routes } from "react-router-dom";

import AboutUs from "../components/AboutUs.js";

// Patient Pages
import LandingPage from "../UserPages/Landing";
import SignIn from "../UserPages/SignIn";
import ForgotPassword from "../UserPages/ForgotPassword";
import SignUp from "../UserPages/SignUp";
import ResetPassword from "../UserPages/ResetPassword";
import TrackAmbulancePage from "../UserPages/TrackAmbulancePage";
import RequestAmbulance from "../UserPages/RequestAmbulance";
import NearbyHospitals from "../UserPages/NearbyHospitals";
import BookAmbulance from "../UserPages/BookAmbulance";
import LookingForDriver from "../UserPages/LookingForDriver";
import WaitingForDriver from "../UserPages/WaitingForDriver";
import StripePage from "../components/StripePage";
import ProfilePage from "../UserPages/ProfilePage";

// Login Context
import { LoginProvider } from "../LoginContext";

// Partner Dashboard
import PartnerLogin from "../PartnerPages/PartnerLogin";
import PartnerRegister from "../PartnerPages/PartnerRegister";
import PartnerSidebar from "../components/PartnerDashboardSidebar";
import Request from "../PartnerPages/Request";
import Tracking from "../PartnerPages/Tracking";
import Reports from "../PartnerPages/Reports";
import PaymentHistory from "../PartnerPages/PaymentHistory";
import PartnerDriversForm from "../PartnerPages/PartnerDriversForm";
import PartnerDrivers from "../PartnerPages/PartnerDrivers";
import PartnerDriverDetails from "../PartnerPages/PartnerDriverDetails";
import PartnerResetPassword from "../PartnerPages/PartnerResetPassword";
import PartnerForgotPassword from "../PartnerPages/PartnerForgotPassword";
import UpdatePartnerDriverForm from "../PartnerPages/UpdatePartnerDriverForm.js"; 
import AssignDriverPage from "../PartnerPages/AssignDriverPage.js";
import AssignMultipleDrivers from "../PartnerPages/AssignMultipleDrivers.js";

// Admin Dashboard  
import AdminSidebar from "../components/AdminDashboardSidebar";
import PartnerOnboardingAndCommission from "../AdminPages/PartnerOnboardingAndCommission";
import CommissionManagement from "../AdminPages/CommissionManagement";
import AdminReports from "../AdminPages/AdminReports";
import IndividualDrivers from "../AdminPages/IndividualDrivers";
import IndividualDriverDetails from "../AdminPages/IndividualDriverDetails";
import AdminLogin from "../AdminPages/AdminLogin";

// Driver Dashboard
import DriverSidebar from "../components/DriverDashboardSidebar";
import DriverHome from "../DriverPages/DriverHome";
import DriverProfile from "../DriverPages/DriverProfile";
import DriverTrips from "../DriverPages/DriverTrips";

// Driver Auth
import DriverLogin from "../DriverPages/DriverLogin";
import DriverRegister from "../DriverPages/DriverRegister";
import DriverResetPassword from "../DriverPages/DriverResetPassword";
import DriverForgotPassword from "../DriverPages/DriverForgotPassword";

const AllRoutes = () => {
  return (
    <LoginProvider>
      <Routes>
        {/* Public & Patient Routes */}
        <Route path="/stripe-payment" element={<StripePage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
        <Route path="/request-ambulance" element={<RequestAmbulance />} />
        <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
        <Route
          path="/nearby-hospitals/book-ambulance"
          element={<BookAmbulance />}
        />
        <Route path="/track-ambulance" element={<TrackAmbulancePage />} />
        <Route path="/looking-for-driver" element={<LookingForDriver />} />
        <Route path="/waiting-for-driver" element={<WaitingForDriver />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Partner Dashboard with Sidebar Layout */}
        <Route path="/partner-login" element={<PartnerLogin />} />
        <Route path="/partner-register" element={<PartnerRegister />} />
        <Route path="/partner-dashboard" element={<PartnerSidebar />}>
          <Route path="requests" element={<Request />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="drivers" element={<PartnerDriversForm />} />
          <Route path="partner-drivers" element={<PartnerDrivers />} />
          <Route path="partner-driver-details" element={<PartnerDriverDetails />} />
          <Route path="update-driver" element={<UpdatePartnerDriverForm />} />
          <Route path="assign-driver" element={<AssignDriverPage />} />
          <Route path="/partner-dashboard/assign-multiple-drivers" element={<AssignMultipleDrivers />} />

        </Route>

        {/* Partner Auth */}
        <Route path="/partner-forgot-password" element={<PartnerForgotPassword />} />
        <Route path="/partner-reset-password/:token" element={<PartnerResetPassword />} />

        {/* Admin Dashboard */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminSidebar />}>
          <Route path="partner-onbording" element={<PartnerOnboardingAndCommission />} />
          <Route path="commission-management" element={<CommissionManagement />} />
          <Route path="admin-reports" element={<AdminReports />} />
          <Route path="individual-drivers" element={<IndividualDrivers />} />
          <Route path="individual-driver-details" element={<IndividualDriverDetails />} />
        </Route>

        {/* Driver Dashboard */}
        <Route path="/driver-dashboard" element={<DriverSidebar />}>
          <Route index element={<DriverHome />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="trips" element={<DriverTrips />} />
        </Route>

        {/* Driver Auth Routes */}
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/driver-register" element={<DriverRegister />} />
        <Route path="/driver-reset-password/:token" element={<DriverResetPassword />} />
        <Route path="/driver-forgot-password" element={<DriverForgotPassword />} />
      </Routes>
    </LoginProvider>
  );
};

export default AllRoutes;
