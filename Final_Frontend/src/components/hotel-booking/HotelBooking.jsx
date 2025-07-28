import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/footer";
import "./Booking.css";

const HotelBooking = () => {
  const { id: hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get hotel data from navigation state or fetch it
  const [hotel, setHotel] = useState(location.state?.hotel || null);
  const [searchData, setSearchData] = useState(location.state?.searchData || {
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    rooms: 1
  });
  const [loading, setLoading] = useState(!hotel);

  // State for booking
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfNights, setNumberOfNights] = useState(1);

  // Mock room data if not available
  const mockRooms = [
    {
      _id: "room1",
      title: "Deluxe Room",
      price: hotel?.cheapestPrice || 5000,
      desc: "Spacious room with modern amenities",
      maxPeople: 2,
      roomNumbers: [101, 102, 103, 104, 105]
    },
    {
      _id: "room2",
      title: "Executive Suite",
      price: (hotel?.cheapestPrice || 5000) * 1.5,
      desc: "Luxury suite with separate living area",
      maxPeople: 4,
      roomNumbers: [201, 202, 203]
    },
    {
      _id: "room3",
      title: "Presidential Suite",
      price: (hotel?.cheapestPrice || 5000) * 2.5,
      desc: "Ultimate luxury with panoramic views",
      maxPeople: 6,
      roomNumbers: [301, 302]
    }
  ];

  // State for available rooms fetched from the backend
  const [availablePhysicalRooms, setAvailablePhysicalRooms] = useState([]);
  const [roomsAvailabilityLoading, setRoomsAvailabilityLoading] = useState(false);
  const [roomsAvailabilityError, setRoomsAvailabilityError] = useState(null);

  // State for total price calculation
  const [totalPrice, setTotalPrice] = useState(0);

  // Effect to fetch available physical rooms from backend based on dates and guests
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      // Don't fetch if crucial data is missing or invalid
      if (!checkIn || !checkOut || !hotelId || !hotel || hotel.rooms.length === 0) {
        setAvailablePhysicalRooms([]);
        // Reset selected room if dependencies are not met
        setSelectedRoomTypeId("");
        setSelectedPhysicalRoomNumber("");
        setTotalPrice(0);
        return;
      }

      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
        setAvailablePhysicalRooms([]);
        setSelectedRoomTypeId("");
        setSelectedPhysicalRoomNumber("");
        setTotalPrice(0);
        return;
      }

      setRoomsAvailabilityLoading(true);
      setRoomsAvailabilityError(null);

      try {
        // API call to your backend's booking controller for availability
        const response = await axios.get(
          `http://localhost:5000/api/bookings/available/${hotelId}?startDate=${checkIn}&endDate=${checkOut}&adults=${adults}`
        );
        setAvailablePhysicalRooms(response.data);

        // After fetching new availability, check if the previously selected room is still available.
        // If not, reset the selection to prevent booking an unavailable room.
        const currentSelectionStillAvailable = response.data.some(
          room => room.roomTypeId === selectedRoomTypeId && room.number === selectedPhysicalRoomNumber
        );
        if (!currentSelectionStillAvailable) {
          setSelectedRoomTypeId("");
          setSelectedPhysicalRoomNumber("");
        }
      } catch (err) {
        console.error("Error fetching available rooms:", err);
        setRoomsAvailabilityError(err);
        setAvailablePhysicalRooms([]); // Clear rooms on error
      } finally {
        setRoomsAvailabilityLoading(false);
      }
    };

    fetchAvailableRooms();
  }, [checkIn, checkOut, hotelId, adults, hotel, selectedRoomTypeId, selectedPhysicalRoomNumber]); // Dependencies

  // Effect to calculate total price whenever selected room, dates, or hotel data changes
  useEffect(() => {
    if (selectedRoomTypeId && selectedPhysicalRoomNumber && checkIn && checkOut && hotel && hotel.rooms) {
      // Find the room type details from the initial hotel fetch
      const roomType = hotel.rooms.find((r) => r._id === selectedRoomTypeId);
      if (roomType) {
        const nights = Math.ceil(
          (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
        );
        setTotalPrice(roomType.price * nights);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [selectedRoomTypeId, selectedPhysicalRoomNumber, checkIn, checkOut, hotel]);

  // Handler for room selection dropdown change
  const handleRoomSelectionChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "") { // Handle "Select a room" option
      setSelectedRoomTypeId("");
      setSelectedPhysicalRoomNumber("");
      return;
    }

    // The option value is `${physicalRoom._id}-${physicalRoom.number}`
    const [physicalRoomSubDocId, roomNumberStr] = selectedValue.split('-');
    const roomNumber = parseInt(roomNumberStr, 10);

    // Find the full room object from the availablePhysicalRooms array to get its details
    const selectedRoom = availablePhysicalRooms.find(
      room => room._id === physicalRoomSubDocId && room.number === roomNumber
    );

    if (selectedRoom) {
      setSelectedRoomTypeId(selectedRoom.roomTypeId); // Set the actual Room TYPE ID
      setSelectedPhysicalRoomNumber(selectedRoom.number); // Set the physical room number
    } else {
      setSelectedRoomTypeId("");
      setSelectedPhysicalRoomNumber("");
    }
  };

  // Handler for booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!selectedRoomTypeId || !selectedPhysicalRoomNumber || !checkIn || !checkOut) {
      alert("Please select a room and fill all date fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // IMPORTANT: Replace "YOUR_USER_ID_HERE" with the actual user ID from your authentication context/session
          // For example: userId: user._id if you have AuthContext
          userId: "YOUR_USER_ID_HERE",
          hotelId: hotel._id,
          roomId: selectedRoomTypeId, // This is the ID of the Room TYPE
          roomNumber: selectedPhysicalRoomNumber, // This is the actual physical room number (e.g., 101)
          checkIn: checkIn, // Matches your Booking model's field name
          checkOut: checkOut, // Matches your Booking model's field name
          adults: adults,
          children: children,
          totalPrice: totalPrice, // Ensure correct total price is sent
          status: "pending" // Matches your Booking model's enum default
        }),
        credentials: "include", // Include cookies for authentication if applicable
      });

      const data = await response.json();

      if (response.ok) {
        alert("Booking successful!");
        navigate(`/bookings/${data._id}`); // Redirect to a booking confirmation/detail page
      } else {
        // Handle API errors (e.g., room becomes unavailable right before booking)
        alert(data.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      alert("Error making booking. Please check your network and try again.");
      console.error("Booking submission error:", err);
    }
  };

  // Conditional rendering for loading, error, and no hotel data states
  if (hotelLoading || roomsAvailabilityLoading) return <div className="loading">Loading please wait...</div>;
  if (hotelError || roomsAvailabilityError) return <div className="error">Error loading data.</div>;
  if (!hotel) return <div className="no-data">Hotel not found</div>;

  return (
    <>
      <Navbar />
      <div className="booking-container">
        <h1>Book {hotel.name}</h1>
        <div className="booking-content">
          {/* Hotel Information Display */}
          <div className="hotel-info">
            <img
              src={
                hotel.photos && hotel.photos.length > 0
                  ? hotel.photos[0]
                  : "https://via.placeholder.com/500x300?text=No+Image"
              }
              alt={hotel.name}
              className="hotel-image"
            />
            <div className="hotel-details">
              <h2>{hotel.name}</h2>
              <p>
                <strong>Address:</strong> {hotel.address}, {hotel.city}
              </p>
              <p>
                <strong>Description:</strong> {hotel.desc}
              </p>
              <p>
                <strong>Rating:</strong> {hotel.rating} ★
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="booking-form">
            <h2>Booking Details</h2>

            {/* Check-in Date Input */}
            <div className="form-group">
              <label>Check-in Date</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]} // Minimum date is today
                required
              />
            </div>

            {/* Check-out Date Input */}
            <div className="form-group">
              <label>Check-out Date</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                // Minimum check-out is the day after check-in, or today if check-in is not set
                min={checkIn ? new Date(new Date(checkIn).setDate(new Date(checkIn).getDate() + 1)).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Adults Input */}
            <div className="form-group">
              <label>Adults</label>
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                required
              />
            </div>

            {/* Children Input */}
            <div className="form-group">
              <label>Children</label>
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value))}
              />
            </div>

            {/* Select Room Dropdown */}
            <div className="form-group">
              <label>Select Room</label>
              <select
                // The `value` prop needs to reflect the currently selected option.
                // It's a combination of the physical room's sub-document _id and its number.
                value={selectedRoomTypeId && selectedPhysicalRoomNumber ?
                  `${availablePhysicalRooms.find(r => r.roomTypeId === selectedRoomTypeId && r.number === selectedPhysicalRoomNumber)?._id}-${selectedPhysicalRoomNumber}`
                  : ""
                }
                onChange={handleRoomSelectionChange}
                required
                // Disable if dates are not selected, no rooms are available, or availability is loading
                disabled={!checkIn || !checkOut || availablePhysicalRooms.length === 0 || roomsAvailabilityLoading}
              >
                <option value="">
                  {roomsAvailabilityLoading
                    ? "Checking availability..." // Show loading message
                    : availablePhysicalRooms.length > 0
                    ? "Select a room" // Prompt to select
                    : "No rooms available for these dates/guests" // No rooms found
                  }
                </option>
                {/* Map over available rooms received from backend */}
                {availablePhysicalRooms.map((room) => (
                  <option key={room._id} value={`${room._id}-${room.number}`}>
                    {room.title} (Room {room.number}) - ₹{room.price}/night (Max: {room.maxOccupancy} adults)
                  </option>
                ))}
              </select>
            </div>

            {/* Total Price Summary */}
            {totalPrice > 0 && (
              <div className="price-summary">
                <h3>Total Price: ₹{totalPrice}</h3>
                <p>
                  For{" "}
                  {Math.ceil(
                    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                  )}{" "}
                  nights
                </p>
              </div>
            )}

            {/* Confirm Booking Button */}
            <button
              type="submit"
              className="book-button"
              // Disable if no room type or physical room number is selected
              disabled={!selectedRoomTypeId || !selectedPhysicalRoomNumber}
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default HotelBooking;