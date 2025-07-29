import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import { Register } from "./pages/reg/register";
import Login from "./pages/login/login";
import { AuthProvider } from "./context/AuthContext";
import BookingDetails from "./components/booking/BookingDetails";
import BookingConfirmation from "./components/booking/BookingConfirmation";
import HotelDetails from "./components/hotel/HotelDetails";
import UserAccount from "./components/user/UserAccount";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<UserAccount />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/booking/:type/:id" element={<BookingDetails />} />
        <Route path="/booking/confirmation/:bookingNumber" element={<BookingConfirmation />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;