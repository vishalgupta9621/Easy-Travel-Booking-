import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  productInputs,
  userInputs,
  busInputs,
  flightInputs,
  trainInputs,
  hotelInputs,
  packageInputs
} from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="users">
              <Route index element={<List />} />
              <Route path=":userId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={userInputs} title="Add New User" />}
              />
            </Route>
            <Route path="hotels">
              <Route index element={<List />} />
              <Route path=":hotelId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={hotelInputs} title="Add New Hotel" />}
              />
            </Route>
            <Route path="buses">
              <Route index element={<List />} />
              <Route path=":busId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={busInputs} title="Add New Bus" />}
              />
            </Route>
            <Route path="flights">
              <Route index element={<List />} />
              <Route path=":flightId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={flightInputs} title="Add New Flight" />}
              />
            </Route>
            <Route path="trains">
              <Route index element={<List />} />
              <Route path=":trainId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={trainInputs} title="Add New Train" />}
              />
            </Route>
            <Route path="packages">
              <Route index element={<List />} />
              <Route path=":packageId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={packageInputs} title="Add New Package" />}
              />
            </Route>
            <Route path="package-bookings">
              <Route index element={<List />} />
              <Route path=":bookingId" element={<Single />} />
            </Route>
            <Route path="travel-bookings">
              <Route index element={<List />} />
              <Route path=":bookingId" element={<Single />} />
            </Route>
            <Route path="hotel-bookings">
              <Route index element={<List />} />
              <Route path=":bookingId" element={<Single />} />
            </Route>
            <Route path="universal-bookings">
              <Route index element={<List />} />
              <Route path=":bookingId" element={<Single />} />
            </Route>
            <Route path="products">
              <Route index element={<List />} />
              <Route path=":productId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={productInputs} title="Add New Product" />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
