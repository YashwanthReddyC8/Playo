import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LocationSearch from "../components/LocationSearch";
import Home_book from "../components/Home_book.jsx";
import useIsVisible from "../components/UseIsVisible.jsx";
import Home_play from "../components/Home_Play.jsx";
import Popular_games from "../components/Popular_games.jsx";

function Home() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const target = useRef(null);
  const rotatingText = "YOUR ONE STOP PLATFORM●";
  const characters = rotatingText.replace(/\s/g, " ").split("");

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    const crd = pos.coords;
    console.log(`Latitude: ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success, error, options);
  }, []);

  const handleSportClick = (sportName) => {
    navigate(`/venues?sport=${encodeURIComponent(sportName)}`);
  };

  return (
    <div className="bg-white text-gray-800">
      <Header hideLocationSearch={!useIsVisible(target)} />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* LEFT */}
          <div className="md:w-2/5 text-center md:text-left">
            <div ref={target} className="flex justify-center md:justify-start mb-6">
              <LocationSearch location={location} setLocation={setLocation} />
            </div>

            <h1 className="text-4xl font-extrabold leading-tight mb-4 text-gray-900">
              <span className="text-green-600">BOOK</span> SPORTS VENUES.
              <br />
              <span className="text-green-600">JOIN</span> GAMES.
              <br />
              <span className="text-green-600">FIND</span> TRAINERS NEAR YOU.
            </h1>

            <p className="text-gray-600 max-w-md mx-auto md:mx-0">
              The world’s largest sports community to book venues,
              find trainers, and join games near you.
            </p>
          </div>

          {/* RIGHT COLLAGE */}
          <div className="md:w-3/5 relative flex items-center justify-center">
            {/* Circular Rotating Text */}
            <div className="absolute top-1/2 -left-10 -translate-y-1/2 z-20 pointer-events-none hidden md:block">
              <div className="relative w-64 h-64 flex items-center justify-center animate-[spin_20s_linear_infinite_reverse]">
                {characters.map((char, i) => (
                  <span
                    key={i}
                    className="absolute text-[10px] font-bold uppercase h-32 origin-bottom"
                    style={{
                      transform: `rotate(${i * (360 / characters.length)}deg)`,
                      bottom: "50%",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Collage */}
            <div className="relative flex w-full max-w-[850px] items-center">
              <div className="w-1/2 pr-1">
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/576a692d-63cb-4eaf-94d7-5c87cf4e449a-playo-co/assets/images/hero_left-3.png"
                  className="w-full object-contain"
                />
              </div>

              <div className="w-1/2 flex flex-col gap-1 relative">
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[30%] z-30">
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/576a692d-63cb-4eaf-94d7-5c87cf4e449a-playo-co/assets/images/hero_playo_logo-4.png"
                    className="w-full drop-shadow-lg"
                  />
                </div>

                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/576a692d-63cb-4eaf-94d7-5c87cf4e449a-playo-co/assets/images/hero_right_top-5.png"
                  className="w-full object-contain"
                />
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/576a692d-63cb-4eaf-94d7-5c87cf4e449a-playo-co/assets/images/hero_right_bottom-6.png"
                  className="w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* SECTIONS */}
      <section className="space-y-20">
        <Home_book />
        <Home_play />
        <Popular_games onSportClick={handleSportClick} />
      </section>

      <Footer />
    </div>
  );
}

export default Home;