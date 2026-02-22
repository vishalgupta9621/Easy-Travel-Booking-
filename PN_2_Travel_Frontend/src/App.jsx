import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import { Register } from "./pages/reg/register";
import Login from "./pages/login/login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import BookingDetails from "./components/booking/BookingDetails";
import BookingConfirmation from "./components/booking/BookingConfirmation";
import HotelDetails from "./components/hotel/HotelDetails";
import PackageDetails from "./components/package/PackageDetails";
import DynamicPackageBooking from "./components/packageBooking/DynamicPackageBooking";
import UserAccount from "./components/user/UserAccount";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminAccess from "./components/admin/AdminAccess";
import BookingDebug from "./components/debug/BookingDebug";
import ApiTest from "./components/debug/ApiTest";
import SimpleBookingTest from "./components/debug/SimpleBookingTest";
import DebugNavigation from "./components/debug/DebugNavigation";

import Chatbot from "./components/common/Chatbot";
import HotelOwnerRegistration from "./pages/hotelOwner/HotelOwnerRegistration";
import HotelOwnerDashboard from "./pages/hotelOwner/HotelOwnerDashboard";
import HelpCenter from "./pages/support/HelpCenter";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<UserAccount />} />
        <Route path="/hotel-owner-registration" element={<HotelOwnerRegistration />} />
        <Route path="/hotel-owner-dashboard" element={<HotelOwnerDashboard />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/admin-access" element={<AdminAccess />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/debug-bookings" element={<BookingDebug />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/simple-test" element={<SimpleBookingTest />} />
        <Route path="/debug" element={<DebugNavigation />} />

        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/package/:id" element={<PackageDetails />} />
        <Route path="/package-booking/:id" element={<DynamicPackageBooking />} />
        <Route path="/booking/:type/:id" element={<BookingDetails />} />
        <Route path="/booking/confirmation/:bookingNumber" element={<BookingConfirmation />} />
      </Routes>
      <Chatbot />
    </AuthProvider>
  );
}

export default App;