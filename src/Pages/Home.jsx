import React, { useState, useRef } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer";
import LocationSearch from "../components/LocationSearch.jsx";
import Home_book from "../components/Home_book.jsx";
import useIsVisible from "../components/UseIsVisible.jsx";
import Home_play from "../components/Home_Play.jsx";
import Popular_games from "../components/Popular_games.jsx";
// import LoginModal from "./LoginModal.jsx";
function Home() {
  const [location, setLocation] = useState("");
  // const [showLogin, setShowLogin] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const target = useRef(null);
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    const crd = pos.coords;

    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  const glassmorphism = {
    // borderTop: "2px solid #ffffff75",
    // borderLeft: "2px solid #ffffff75",
    boxShadow: "5px 5px 12px #00000035",
    background: "#ffffff25",
    borderRadius: "15px",
    overflow: "hidden",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)", /* Safari support */
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
  return (
    <div>
      <div className="sticky top-2 z-50  rounded-b-xl" style={glassmorphism} >
        <Header hideLocationSearch={!useIsVisible(target)} />
      </div>

      {/* Standard display */}
      {/* HERO */}
      <div >
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-8 px-6 py-12 items-center">
          <div>
            <div ref={target} className="flex justify-center">
              <LocationSearch
                location={location}
                setLocation={setLocation}
                className="ml-2"
              />
            </div>

            <h1 className="text-4xl font-extrabold leading-tight my-4">
              BOOK SPORTS VENUES.
              <br />
              JOIN GAMES.
              <br />
              FIND TRAINERS NEAR YOU.
            </h1>
            <p className="text-gray-600 max-w-md justify-center">
              The World's Largest Sports Community to Book Venues, Find
              Trainers, and Join Games Near You.
            </p>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <img
              className="rounded-2xl object-cover h-40 w-full"
              src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800"
            />
            <img
              className="rounded-2xl object-cover h-40 w-full"
              src="https://playo-website.gumlet.io/playo-website-v3/hero/hero_right_top.png?q=50"
            />
            <img
              className="rounded-2xl object-cover h-40 w-full"
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"
            />
            <img
              className="rounded-2xl object-cover h-40 w-full"
              src="https://playo-website.gumlet.io/playo-website-v3/hero/hero_right_bottom.png?q=50"
            />
          </div>
        </div>
      </div>
      <div>
        <Home_book />
        <Home_play />
        <Popular_games />
      </div>

      <Footer />
    </div>
  );
}
export default Home;
