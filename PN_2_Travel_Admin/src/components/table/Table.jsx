import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  userService,
  busService,
  flightService,
  trainService,
  hotelService,
  travelBookingService,
  hotelBookingService,
  universalBookingService,
  bookingService,
  packageService
} from "../../services/api.service";

const DEFAULT_HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60"
];

const List = ({ isHomePage = false }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: isHomePage ? 5 : 10, // Show fewer items on home page
    pages: 0
  });

  // Determine page type and service
  const getPageInfo = () => {
    if (pathname.includes("/users")) return { type: "users", service: userService };
    if (pathname.includes("/hotels")) return { type: "hotels", service: hotelService };
    if (pathname.includes("/buses")) return { type: "buses", service: busService };
    if (pathname.includes("/flights")) return { type: "flights", service: flightService };
    if (pathname.includes("/trains")) return { type: "trains", service: trainService };
    if (pathname.includes("/packages")) return { type: "packages", service: packageService };
    if (pathname.includes("/package-bookings")) return { type: "package-bookings", service: packageService };
    // Use main booking service for all booking types since they're in the same collection
    if (pathname.includes("/travel-bookings")) return { type: "travel-bookings", service: bookingService, filter: "travel" };
    if (pathname.includes("/hotel-bookings")) return { type: "hotel-bookings", service: bookingService, filter: "hotel" };
    if (pathname === "/bookings" || pathname.endsWith("/bookings")) return { type: "bookings", service: bookingService };
    if (pathname.includes("/universal-bookings")) return { type: "universal-bookings", service: universalBookingService };
    return { type: "products", service: null };
  };

  const pageInfo = getPageInfo();

  const getRandomDefaultImage = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_HOTEL_IMAGES.length);
    return DEFAULT_HOTEL_IMAGES[randomIndex];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (pageInfo.service) {
          let response;

          // Special handling for package bookings
          if (pageInfo.type === 'package-bookings') {
            response = await pageInfo.service.getPackageBookings(pagination.page, pagination.limit);
          } else if (pageInfo.filter) {
            // For filtered booking types (travel-bookings, hotel-bookings)
            response = await pageInfo.service.getPaginated(pagination.page, pagination.limit);
            // Filter the response data based on booking type
            if (response.data && Array.isArray(response.data)) {
              const filteredData = response.data.filter(booking => {
                if (pageInfo.filter === 'travel') {
                  return ['flight', 'train', 'bus'].includes(booking.bookingType);
                } else if (pageInfo.filter === 'hotel') {
                  return booking.bookingType === 'hotel';
                }
                return true;
              });
              response.data = filteredData;
              // Update pagination to reflect filtered results
              response.pagination = {
                ...response.pagination,
                total: filteredData.length,
                pages: Math.ceil(filteredData.length / pagination.limit)
              };
            }
          } else {
            response = await pageInfo.service.getPaginated(pagination.page, pagination.limit);
          }

          // Handle different response structures
          if (response.users) {
            setData(response.users);
            setPagination(response.pagination);
          } else if (response.hotels) {
            setData(response.hotels);
            setPagination(response.pagination);
          } else if (response.buses) {
            setData(response.buses);
            setPagination(response.pagination);
          } else if (response.flights) {
            setData(response.flights);
            setPagination(response.pagination);
          } else if (response.trains) {
            setData(response.trains);
            setPagination(response.pagination);
          } else if (response.packages) {
            setData(response.packages);
            setPagination(response.pagination);
          } else if (response.bookings) {
            setData(response.bookings);
            setPagination(response.pagination);
          } else if (response.data && response.data.bookings) {
            // For package bookings API response structure
            setData(response.data.bookings);
            setPagination(response.data.pagination);
          } else if (response.data && Array.isArray(response.data)) {
            // For new booking API response structure
            setData(response.data);
            setPagination(response.pagination);
          } else {
            // Fallback for direct array response
            setData(response);
          }
        } else if (isHomePage) {
          // For home page, show recent bookings
          try {
            const response = await bookingService.getPaginated(1, 5);
            if (response.data && Array.isArray(response.data)) {
              setData(response.data);
              setPagination(response.pagination);
            }
          } catch (error) {
            console.error("Error fetching recent bookings:", error);
            setData([]);
          }
        } else {
          // For products or other static data
          setData([
            {
              id: 1143155,
              product: "Acer Nitro 5",
              img: "https://m.media-amazon.com/images/I/81bc8mA3nKL._AC_UY327_FMwebp_QL65_.jpg",
              customer: "John Smith",
              date: "1 March",
              amount: 785,
              method: "Cash on Delivery",
              status: "Approved",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.page, pagination.limit, pageInfo.type]);

  const renderTableHeaders = () => {
    // For home page, show booking headers
    if (isHomePage) {
      return (
        <>
          <TableCell className="tableCell">Booking Number</TableCell>
          <TableCell className="tableCell">Type</TableCell>
          <TableCell className="tableCell">Customer</TableCell>
          <TableCell className="tableCell">Date</TableCell>
          <TableCell className="tableCell">Amount</TableCell>
          <TableCell className="tableCell">Status</TableCell>
        </>
      );
    }

    switch (pageInfo.type) {
      case "users":
        return (
          <>
            <TableCell className="tableCell">Username</TableCell>
            <TableCell className="tableCell">Name</TableCell>
            <TableCell className="tableCell">Email</TableCell>
            <TableCell className="tableCell">Phone</TableCell>
            <TableCell className="tableCell">Location</TableCell>
            <TableCell className="tableCell">Status</TableCell>
            <TableCell className="tableCell">Verified</TableCell>
          </>
        );
      case "hotels":
        return (
          <>
            <TableCell className="tableCell">Hotel Name</TableCell>
            <TableCell className="tableCell">Type</TableCell>
            <TableCell className="tableCell">Location</TableCell>
            <TableCell className="tableCell">Distance</TableCell>
            <TableCell className="tableCell">Rating</TableCell>
            <TableCell className="tableCell">Price</TableCell>
            <TableCell className="tableCell">Featured</TableCell>
          </>
        );
      case "buses":
        return (
          <>
            <TableCell className="tableCell">Bus Number</TableCell>
            <TableCell className="tableCell">Operator</TableCell>
            <TableCell className="tableCell">Type</TableCell>
            <TableCell className="tableCell">Route</TableCell>
            <TableCell className="tableCell">Departure</TableCell>
            <TableCell className="tableCell">Price</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "flights":
        return (
          <>
            <TableCell className="tableCell">Flight Number</TableCell>
            <TableCell className="tableCell">Airline</TableCell>
            <TableCell className="tableCell">Route</TableCell>
            <TableCell className="tableCell">Departure</TableCell>
            <TableCell className="tableCell">Duration</TableCell>
            <TableCell className="tableCell">Economy Price</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "trains":
        return (
          <>
            <TableCell className="tableCell">Train Number</TableCell>
            <TableCell className="tableCell">Train Name</TableCell>
            <TableCell className="tableCell">Type</TableCell>
            <TableCell className="tableCell">Route</TableCell>
            <TableCell className="tableCell">Departure</TableCell>
            <TableCell className="tableCell">Duration</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "packages":
        return (
          <>
            <TableCell className="tableCell">Package Name</TableCell>
            <TableCell className="tableCell">Type</TableCell>
            <TableCell className="tableCell">Destinations</TableCell>
            <TableCell className="tableCell">Duration</TableCell>
            <TableCell className="tableCell">Base Price</TableCell>
            <TableCell className="tableCell">Rating</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "package-bookings":
        return (
          <>
            <TableCell className="tableCell">Booking Number</TableCell>
            <TableCell className="tableCell">Package</TableCell>
            <TableCell className="tableCell">Customer</TableCell>
            <TableCell className="tableCell">Travel Date</TableCell>
            <TableCell className="tableCell">Travelers</TableCell>
            <TableCell className="tableCell">Total Amount</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "travel-bookings":
        return (
          <>
            <TableCell className="tableCell">Booking Number</TableCell>
            <TableCell className="tableCell">Type</TableCell>
            <TableCell className="tableCell">Customer</TableCell>
            <TableCell className="tableCell">Service</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "hotel-bookings":
        return (
          <>
            <TableCell className="tableCell">Booking Number</TableCell>
            <TableCell className="tableCell">Hotel</TableCell>
            <TableCell className="tableCell">Customer</TableCell>
            <TableCell className="tableCell">Travel Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "universal-bookings":
        return (
          <>
            <TableCell className="tableCell">Ticket ID</TableCell>
            <TableCell className="tableCell">Type</TableCell>
            <TableCell className="tableCell">User</TableCell>
            <TableCell className="tableCell">Service</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      case "bookings":
        return (
          <>
            <TableCell className="tableCell">Booking Number</TableCell>
            <TableCell className="tableCell">Type</TableCell>
            <TableCell className="tableCell">Customer</TableCell>
            <TableCell className="tableCell">Item</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
      default:
        return (
          <>
            <TableCell className="tableCell">Tracking ID</TableCell>
            <TableCell className="tableCell">Product</TableCell>
            <TableCell className="tableCell">Customer</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Payment Method</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </>
        );
    }
  };

  const renderTableRow = (item) => {
    // For home page, show booking rows
    if (isHomePage) {
      return (
        <>
          <TableCell className="tableCell">{item.bookingNumber}</TableCell>
          <TableCell className="tableCell">{item.bookingType}</TableCell>
          <TableCell className="tableCell">{item.customerInfo?.name}</TableCell>
          <TableCell className="tableCell">
            {new Date(item.createdAt).toLocaleDateString()}
          </TableCell>
          <TableCell className="tableCell">₹{item.totalAmount}</TableCell>
          <TableCell className="tableCell">
            <span className={`status ${item.bookingStatus}`}>{item.bookingStatus}</span>
          </TableCell>
        </>
      );
    }

    switch (pageInfo.type) {
      case "users":
        return (
          <>
            <TableCell className="tableCell">{item.username}</TableCell>
            <TableCell className="tableCell">
              {item.firstName} {item.lastName}
            </TableCell>
            <TableCell className="tableCell">{item.email}</TableCell>
            <TableCell className="tableCell">{item.phone}</TableCell>
            <TableCell className="tableCell">
              {item.city ? `${item.city}, ${item.state}, ${item.country}` : 'Not specified'}
            </TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.status}`}>{item.status}</span>
            </TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.is_verified ? 'Approved' : 'Pending'}`}>
                {item.is_verified ? 'Verified' : 'Not Verified'}
              </span>
            </TableCell>
          </>
        );
      case "hotels":
        const hotelImage = item.photos?.[0]?.url || getRandomDefaultImage();
        return (
          <>
            <TableCell className="tableCell">
              <div className="cellWrapper">
                <img
                  src={hotelImage}
                  alt={item.name}
                  className="image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getRandomDefaultImage();
                  }}
                />
                {item.name}
              </div>
            </TableCell>
            <TableCell className="tableCell">{item.type}</TableCell>
            <TableCell className="tableCell">{item.city}, {item.address}</TableCell>
            <TableCell className="tableCell">{item.distance}</TableCell>
            <TableCell className="tableCell">
              <span className="rating">{item.rating} ★</span>
            </TableCell>
            <TableCell className="tableCell">₹{item.cheapestPrice}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.featured ? 'Approved' : 'Pending'}`}>
                {item.featured ? 'Featured' : 'Not Featured'}
              </span>
            </TableCell>
          </>
        );
      case "buses":
        return (
          <>
            <TableCell className="tableCell">{item.busNumber}</TableCell>
            <TableCell className="tableCell">{item.operator?.name}</TableCell>
            <TableCell className="tableCell">{item.busType}</TableCell>
            <TableCell className="tableCell">
              {item.route?.origin?.name} → {item.route?.destination?.name}
            </TableCell>
            <TableCell className="tableCell">{item.schedule?.departureTime}</TableCell>
            <TableCell className="tableCell">₹{item.basePrice}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.status}`}>{item.status}</span>
            </TableCell>
          </>
        );
      case "flights":
        return (
          <>
            <TableCell className="tableCell">{item.flightNumber}</TableCell>
            <TableCell className="tableCell">{item.airline?.name}</TableCell>
            <TableCell className="tableCell">
              {item.route?.origin?.name} → {item.route?.destination?.name}
            </TableCell>
            <TableCell className="tableCell">{item.schedule?.departureTime}</TableCell>
            <TableCell className="tableCell">{item.schedule?.duration} min</TableCell>
            <TableCell className="tableCell">₹{item.pricing?.economy?.basePrice}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.status}`}>{item.status}</span>
            </TableCell>
          </>
        );
      case "trains":
        return (
          <>
            <TableCell className="tableCell">{item.trainNumber}</TableCell>
            <TableCell className="tableCell">{item.trainName}</TableCell>
            <TableCell className="tableCell">{item.trainType}</TableCell>
            <TableCell className="tableCell">
              {item.route?.origin?.name} → {item.route?.destination?.name}
            </TableCell>
            <TableCell className="tableCell">{item.schedule?.departureTime}</TableCell>
            <TableCell className="tableCell">{item.schedule?.duration}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.status}`}>{item.status}</span>
            </TableCell>
          </>
        );
      case "packages":
        return (
          <>
            <TableCell className="tableCell">
              <div className="cellWrapper">
                <img
                  src={item.images?.[0] || getRandomDefaultImage()}
                  alt={item.name}
                  className="image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getRandomDefaultImage();
                  }}
                />
                {item.name}
              </div>
            </TableCell>
            <TableCell className="tableCell">{item.type}</TableCell>
            <TableCell className="tableCell">{item.destinations?.join(', ')}</TableCell>
            <TableCell className="tableCell">{item.duration} days</TableCell>
            <TableCell className="tableCell">₹{item.basePrice || item.price}</TableCell>
            <TableCell className="tableCell">
              <span className="rating">{item.rating} ★</span>
            </TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.isActive ? 'Approved' : 'Pending'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
          </>
        );
      case "package-bookings":
        return (
          <>
            <TableCell className="tableCell">{item.bookingNumber}</TableCell>
            <TableCell className="tableCell">{item.packageId?.name || 'Package'}</TableCell>
            <TableCell className="tableCell">{item.customerInfo?.name}</TableCell>
            <TableCell className="tableCell">
              {new Date(item.travelDetails?.startDate).toLocaleDateString()}
            </TableCell>
            <TableCell className="tableCell">{item.travelDetails?.numberOfTravelers}</TableCell>
            <TableCell className="tableCell">₹{item.pricingBreakdown?.totalAmount}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.bookingStatus}`}>{item.bookingStatus}</span>
            </TableCell>
          </>
        );
      case "travel-bookings":
        return (
          <>
            <TableCell className="tableCell">{item.bookingNumber}</TableCell>
            <TableCell className="tableCell">{item.bookingType}</TableCell>
            <TableCell className="tableCell">{item.customerInfo?.name}</TableCell>
            <TableCell className="tableCell">
              {item.bookingType === 'flight' ? 'Flight Service' :
               item.bookingType === 'train' ? 'Train Service' :
               item.bookingType === 'bus' ? 'Bus Service' : 'Travel Service'}
            </TableCell>
            <TableCell className="tableCell">
              {new Date(item.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="tableCell">₹{item.totalAmount}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.bookingStatus}`}>{item.bookingStatus}</span>
            </TableCell>
          </>
        );
      case "hotel-bookings":
        return (
          <>
            <TableCell className="tableCell">{item.bookingNumber}</TableCell>
            <TableCell className="tableCell">{item.itemDetails?.name || 'Hotel Booking'}</TableCell>
            <TableCell className="tableCell">{item.customerInfo?.name}</TableCell>
            <TableCell className="tableCell">
              {new Date(item.travelDate || item.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="tableCell">₹{item.totalAmount}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.bookingStatus}`}>{item.bookingStatus}</span>
            </TableCell>
          </>
        );
      case "universal-bookings":
        return (
          <>
            <TableCell className="tableCell">{item.ticketId}</TableCell>
            <TableCell className="tableCell">{item.bookingType}</TableCell>
            <TableCell className="tableCell">{item.userId?.username || item.userId?.firstName}</TableCell>
            <TableCell className="tableCell">
              {item.travelDetails?.serviceName || item.hotelDetails?.hotelName}
            </TableCell>
            <TableCell className="tableCell">
              {new Date(item.bookingDate).toLocaleDateString()}
            </TableCell>
            <TableCell className="tableCell">₹{item.pricing?.totalPrice}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.status}`}>{item.status}</span>
            </TableCell>
          </>
        );
      case "bookings":
        return (
          <>
            <TableCell className="tableCell">{item.bookingNumber}</TableCell>
            <TableCell className="tableCell">{item.bookingType}</TableCell>
            <TableCell className="tableCell">{item.customerInfo?.name}</TableCell>
            <TableCell className="tableCell">
              {item.bookingType === 'hotel' ? 'Hotel Booking' :
               item.bookingType === 'flight' ? 'Flight Booking' :
               item.bookingType === 'train' ? 'Train Booking' :
               item.bookingType === 'bus' ? 'Bus Booking' : 'Package'}
            </TableCell>
            <TableCell className="tableCell">
              {new Date(item.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="tableCell">₹{item.totalAmount}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.bookingStatus}`}>{item.bookingStatus}</span>
            </TableCell>
          </>
        );
      default:
        return (
          <>
            <TableCell className="tableCell">{item.id}</TableCell>
            <TableCell className="tableCell">
              <div className="cellWrapper">
                <img src={item.img} alt="" className="image" />
                {item.product}
              </div>
            </TableCell>
            <TableCell className="tableCell">{item.customer}</TableCell>
            <TableCell className="tableCell">{item.date}</TableCell>
            <TableCell className="tableCell">{item.amount}</TableCell>
            <TableCell className="tableCell">{item.method}</TableCell>
            <TableCell className="tableCell">
              <span className={`status ${item.status}`}>{item.status}</span>
            </TableCell>
          </>
        );
    }
  };

  if (loading) {
    return (
      <TableContainer component={Paper} className="table">
        <div className="loading">Loading...</div>
      </TableContainer>
    );
  }

  if (error) {
    return (
      <TableContainer component={Paper} className="table">
        <div className="error">{error}</div>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} className="table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {renderTableHeaders()}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id || item.id || item.bookingId || item.ticketId}>
              {renderTableRow(item)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pageInfo.service && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages || loading}
          >
            Next
          </button>
        </div>
      )}
    </TableContainer>
  );
};

export default List;
