import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API_URL } from "../../config";

const DEFAULT_HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60"
];

const List = () => {
  const location = useLocation();
  const isUsersPage = location.pathname.includes("/users");
  const isHotelsPage = location.pathname.includes("/hotels");
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    pages: 0
  });

  const getRandomDefaultImage = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_HOTEL_IMAGES.length);
    return DEFAULT_HOTEL_IMAGES[randomIndex];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isUsersPage) {
          const response = await axios.get(`${API_URL}/users/paginated?page=${pagination.page}&limit=${pagination.limit}`);
          setData(response.data.users);
          setPagination(response.data.pagination);
        } else if (isHotelsPage) {
          const response = await axios.get(`${API_URL}/hotels/paginated?page=${pagination.page}&limit=${pagination.limit}`);
          setData(response.data.hotels);
          setPagination(response.data.pagination);
        } else {
          // For products, you can implement similar API call here
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
      }
    };

    fetchData();
  }, [pagination.page, pagination.limit, isUsersPage, isHotelsPage]);

  const renderTableHeaders = () => {
    if (isUsersPage) {
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
    } else if (isHotelsPage) {
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
    } else {
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
    if (isUsersPage) {
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
    } else if (isHotelsPage) {
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
    } else {
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
            <TableRow key={isUsersPage || isHotelsPage ? item._id : item.id}>
              {renderTableRow(item)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(isUsersPage || isHotelsPage) && (
        <div className="pagination">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}
    </TableContainer>
  );
};

export default List;
