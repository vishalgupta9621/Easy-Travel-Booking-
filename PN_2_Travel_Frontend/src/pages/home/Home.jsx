
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import TravelOptions from "../../components/travelOptions/TravelOptions";
import Featured from "../../components/featured/featured";
import "./home.css";

function Home() {
  return (
    <>
      <Navbar/>
      <Header/>
      <TravelOptions/>
      <Featured/>
    </>
  )
}

export default Home
