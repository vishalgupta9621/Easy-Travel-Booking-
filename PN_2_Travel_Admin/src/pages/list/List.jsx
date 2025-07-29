import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import { useLocation, Link } from "react-router-dom";
import Table from "../../components/table/Table";
import AddIcon from '@mui/icons-material/Add';

const List = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const getPageInfo = () => {
    if (pathname.includes("/users")) return { title: "Users", createPath: "/users/new", createText: "User" };
    if (pathname.includes("/hotels")) return { title: "Hotels", createPath: "/hotels/new", createText: "Hotel" };
    if (pathname.includes("/flights")) return { title: "Flights", createPath: "/flights/new", createText: "Flight" };
    if (pathname.includes("/trains")) return { title: "Trains", createPath: "/trains/new", createText: "Train" };
    if (pathname.includes("/buses")) return { title: "Buses", createPath: "/buses/new", createText: "Bus" };
    if (pathname.includes("/packages")) return { title: "Packages", createPath: "/packages/new", createText: "Package" };
    if (pathname.includes("/package-bookings")) return { title: "Package Bookings", createPath: null, createText: null };
    if (pathname.includes("/travel-bookings")) return { title: "Travel Bookings", createPath: null, createText: null };
    if (pathname.includes("/hotel-bookings")) return { title: "Hotel Bookings", createPath: null, createText: null };
    if (pathname.includes("/universal-bookings")) return { title: "All Bookings", createPath: null, createText: null };
    return { title: "Products", createPath: "/products/new", createText: "Product" };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <div className="listTitle">
          {pageInfo.title}
          {pageInfo.createPath && (
            <Link to={pageInfo.createPath} className="createButton">
              <AddIcon /> Create {pageInfo.createText}
            </Link>
          )}
        </div>
        <Table />
      </div>
    </div>
  )
}

export default List