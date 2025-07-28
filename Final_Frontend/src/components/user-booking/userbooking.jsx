import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import "./userbooking.css";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:8800/api/bookings/user", {
          credentials: "include", // send cookies for auth
        });
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div>Loading your bookings...</div>;
  if (error) return <div>Error: {error}</div>;
  if (bookings.length === 0) return <div>You have no bookings.</div>;

  return (
    <>
      <Navbar />
      <div className="bookings-container">
        <h1>Your Bookings</h1>
        <ul className="bookings-list">
          {bookings.map((booking) => {
            const nights = Math.ceil(
              (new Date(booking.checkOut) - new Date(booking.checkIn)) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <li key={booking._id} className="booking-item">
                <h2>{booking.hotelId?.name}</h2>
                <p>
                  <strong>City:</strong> {booking.hotelId?.city}
                </p>
                <p>
                  <strong>Room Number:</strong> {booking.roomNumber}
                </p>
                <p>
                  <strong>Check-in:</strong>{" "}
                  {new Date(booking.checkIn).toLocaleDateString()}
                </p>
                <p>
                  <strong>Check-out:</strong>{" "}
                  {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p>
                  <strong>Nights:</strong> {nights}
                </p>
                <p>
                  <strong>Adults:</strong> {booking.adults} |{" "}
                  <strong>Children:</strong> {booking.children}
                </p>
                <p>
                  <strong>Total Price:</strong> ${booking.totalPrice}
                </p>
                <p>
                  <strong>Status:</strong> {booking.status}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default UserBookings;
