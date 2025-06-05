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
import NearbyHospitals from "../pages/NearbyHospitals";
import BookAmbulance from "../pages/BookAmbulance";
import LookingForDriver from '../pages/LookingForDriver'
import WaitingForDriver from '../pages/WaitingForDriver'

// Partner Dashboard
import PartnerSidebar from "../components/PartnerDashboardSidebar";
import Request from "../pages2/Request";
import Tracking from "../pages2/Tracking";
import Reports from "../pages2/Reports";
import PaymentHistory from "../pages2/PaymentHistory";
import PartnerDriversForm from "../pages2/PartnerDriversForm";

// Admin Dashboard
import AdminSidebar from "../components/AdminDashboardSidebar";
import PartnerOnboardingAndCommission from "../pages3/PartnerOnboardingAndCommission";
import CommissionManagement from "../pages3/CommissionManagement";
import AdminReports from "../pages3/AdminReports";
import PartnerDrivers from "../pages3/PartnerDrivers";
import PartnerDriverDetails from "../pages3/PartnerDriverDetails";
import IndividualDrivers from "../pages3/IndividualDrivers";
import IndividualDriverDetails from "../pages3/IndividualDriverDetails";

// Driver Dashboard
import DriverSidebar from "../components/DriverDashboardSidebar";
import DriverHome from "../pages4/DriverHome";
import DriverProfile from "../pages4/DriverProfile";
import DriverTrips from "../pages4/DriverTrips";

// Driver Auth
import DriverLogin from "../pages4/DriverLogin";
import DriverRegister from "../pages4/DriverRegister";
import DriverResetPassword from "../pages4/DriverResetPassword"; // ✅ Import added

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
      <Route path="/nearby-hospitals/book-ambulance" element={<BookAmbulance />} />
      <Route path="/track-ambulance" element={<TrackAmbulancePage />} />
      <Route path="/looking-for-driver" element={<LookingForDriver />} />
      <Route path="/waiting-for-driver" element={<WaitingForDriver />} />

      {/* Partner Dashboard with Sidebar Layout */}
      <Route path="/partner-dashboard" element={<PartnerSidebar />}>
        <Route path="requests" element={<Request />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="reports" element={<Reports />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="drivers" element={<PartnerDriversForm />} />
      </Route>

      {/* Driver Password Reset Route */}
      <Route
        path="/driverResetPassword/:token"
        element={<DriverResetPassword />}
      />

      {/* Driver Auth Routes */}
      <Route path="/driver-login" element={<DriverLogin />} />
      <Route path="/driver-register" element={<DriverRegister />} />


      {/* Admin Dashboard */}
      <Route path="/admin-dashboard" element={<AdminSidebar />}>
        <Route
          path="partner-onbording"
          element={<PartnerOnboardingAndCommission />}
        />
        <Route
          path="commission-management"
          element={<CommissionManagement />}
        />
        <Route path="admin-reports" element={<AdminReports />} />
        <Route path="partner-drivers" element={<PartnerDrivers />} />
        <Route
          path="partner-driver-details"
          element={<PartnerDriverDetails />}
        />
        <Route path="individual-drivers" element={<IndividualDrivers />} />
        <Route
          path="individual-driver-details"
          element={<IndividualDriverDetails />}
        />
      </Route>

      {/* Driver Dashboard */}
      <Route path="/driver-dashboard" element={<DriverSidebar />}>
        <Route index element={<DriverHome />} />
        <Route path="profile" element={<DriverProfile />} />
        <Route path="trips" element={<DriverTrips />} />
      </Route>
    </Routes>
  );
};

export default AllRoutes;
