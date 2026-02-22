
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import TravelOptions from "../../components/travelOptions/TravelOptions";
import Featured from "../../components/featured/featured";
import Footer from "../../components/common/Footer";
import "./home.css";

function Home() {
  return (
    <>
      <Navbar/>
      <Header/>
      <TravelOptions/>
      <Featured/>
      <Footer />
    </>
  )
}

export default Home
