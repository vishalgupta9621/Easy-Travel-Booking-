export const userColumns = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "user",
    headerName: "User",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.img || "https://via.placeholder.com/40"} alt="avatar" />
          {params.row.username}
        </div>
      );
    },
  },
  {
    field: "email", 
    headerName: "Email",
    width: 230,
  },
  {
    field: "phone",
    headerName: "Phone",
    width: 150,
  },
  {
    field: "age",
    headerName: "Age",
    width: 100,
  },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
  {
    field: "is_verified",
    headerName: "Verified",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.is_verified ? 'verified' : 'unverified'}`}>
          {params.row.is_verified ? 'Yes' : 'No'}
        </div>
      );
    },
  },
];

// Bus Columns
export const busColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "busNumber", headerName: "Bus Number", width: 120 },
  { field: "operatorName", headerName: "Operator", width: 150 },
  { field: "busType", headerName: "Type", width: 120 },
  { field: "origin", headerName: "Origin", width: 150 },
  { field: "destination", headerName: "Destination", width: 150 },
  { field: "departureTime", headerName: "Departure", width: 120 },
  { field: "basePrice", headerName: "Price", width: 100 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
];

// Flight Columns
export const flightColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "flightNumber", headerName: "Flight Number", width: 130 },
  { field: "airlineName", headerName: "Airline", width: 150 },
  { field: "origin", headerName: "Origin", width: 150 },
  { field: "destination", headerName: "Destination", width: 150 },
  { field: "departureTime", headerName: "Departure", width: 120 },
  { field: "duration", headerName: "Duration", width: 100 },
  { field: "economyPrice", headerName: "Economy Price", width: 120 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
];

// Train Columns
export const trainColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "trainNumber", headerName: "Train Number", width: 130 },
  { field: "trainName", headerName: "Train Name", width: 180 },
  { field: "trainType", headerName: "Type", width: 120 },
  { field: "origin", headerName: "Origin", width: 150 },
  { field: "destination", headerName: "Destination", width: 150 },
  { field: "departureTime", headerName: "Departure", width: 120 },
  { field: "duration", headerName: "Duration", width: 100 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
];

// Hotel Columns
export const hotelColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Hotel Name", width: 200 },
  { field: "type", headerName: "Type", width: 120 },
  { field: "city", headerName: "City", width: 150 },
  { field: "address", headerName: "Address", width: 200 },
  { field: "rating", headerName: "Rating", width: 100 },
  { field: "cheapestPrice", headerName: "Starting Price", width: 130 },
  {
    field: "featured",
    headerName: "Featured",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.featured ? 'featured' : 'normal'}`}>
          {params.row.featured ? 'Yes' : 'No'}
        </div>
      );
    },
  },
];

// Travel Booking Columns
export const travelBookingColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "bookingId", headerName: "Booking ID", width: 130 },
  { field: "travelType", headerName: "Type", width: 100 },
  { field: "userName", headerName: "User", width: 150 },
  { field: "origin", headerName: "Origin", width: 150 },
  { field: "destination", headerName: "Destination", width: 150 },
  { field: "departureDate", headerName: "Departure Date", width: 130 },
  { field: "totalAmount", headerName: "Amount", width: 120 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.paymentStatus}`}>
          {params.row.paymentStatus}
        </div>
      );
    },
  },
];

// Hotel Booking Columns
export const hotelBookingColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "bookingId", headerName: "Booking ID", width: 130 },
  { field: "hotelName", headerName: "Hotel", width: 180 },
  { field: "userName", headerName: "User", width: 150 },
  { field: "roomType", headerName: "Room Type", width: 130 },
  { field: "checkIn", headerName: "Check In", width: 120 },
  { field: "checkOut", headerName: "Check Out", width: 120 },
  { field: "totalPrice", headerName: "Amount", width: 120 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.paymentStatus}`}>
          {params.row.paymentStatus}
        </div>
      );
    },
  },
];

// Universal Booking Columns
export const universalBookingColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "ticketId", headerName: "Ticket ID", width: 130 },
  { field: "bookingType", headerName: "Type", width: 100 },
  { field: "userName", headerName: "User", width: 150 },
  { field: "serviceName", headerName: "Service", width: 180 },
  { field: "bookingDate", headerName: "Booking Date", width: 130 },
  { field: "totalPrice", headerName: "Amount", width: 120 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.paymentStatus}`}>
          {params.row.paymentStatus}
        </div>
      );
    },
  },
];

//temporary data - keeping original user data for reference
export const userRows = [
  {
    id: 1,
    username: "Snow",
    img: "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
    status: "active",
    email: "1snow@gmail.com",
    phone: "+1234567890",
    age: 35,
    is_verified: true,
  },
  {
    id: 2,
    username: "Jamie Lannister",
    img: "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
    email: "2snow@gmail.com",
    phone: "+1234567891",
    status: "inactive",
    age: 42,
    is_verified: false,
  },
];
