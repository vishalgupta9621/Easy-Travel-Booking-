import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Register from "./pages/reg/register";
import Login from "./pages/login/login";
import Cities from "./components/city-based/city";
import CityHotels from "./components/city-based/cityhotels";
import SimpleHotelBooking from "./components/hotel-booking/SimpleHotelBooking";
import UserBookings from "./components/user-booking/userbooking";
import TravelBooking from "./pages/travel/TravelBooking";
import BookingForm from "./components/booking-form/BookingForm";
import BookingConfirmation from "./pages/booking-confirmation/BookingConfirmation";
import Flights from "./pages/flights/Flights";
import Trains from "./pages/trains/Trains";
import Buses from "./pages/buses/Buses";
import Test from "./pages/test/Test";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<Test />} />
      <Route path="/flights" element={<Flights />} />
      <Route path="/trains" element={<Trains />} />
      <Route path="/buses" element={<Buses />} />
      <Route path="/travel" element={<TravelBooking />} />
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/cities" element={<Cities />} />
      <Route path="/city/:cityId" element={<CityHotels />} />
      <Route path="/hotels/:id/book" element={<SimpleHotelBooking />} />
      <Route path="/my-bookings" element={<UserBookings />} />
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
  );
}

export default App;