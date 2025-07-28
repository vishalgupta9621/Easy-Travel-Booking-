import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import { useLocation, Link } from "react-router-dom";
import Table from "../../components/table/Table";
import AddIcon from '@mui/icons-material/Add';

const List = () => {
  const location = useLocation();
  const isUsersPage = location.pathname.includes("/users");
  const isHotelsPage = location.pathname.includes("/hotels");

  const getTitle = () => {
    if (isUsersPage) return "Users";
    if (isHotelsPage) return "Hotels";
    return "Products";
  };

  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <div className="listTitle">
          {getTitle()}
          {(isUsersPage || isHotelsPage) && (
            <Link to={isUsersPage ? "/users/new" : "/hotels/new"} className="createButton">
              <AddIcon /> Create {isUsersPage ? "User" : "Hotel"}
            </Link>
          )}
        </div>
        <Table />
      </div>
    </div>
  )
}

export default List