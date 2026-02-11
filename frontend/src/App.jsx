import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import "./app.css";
import Trainers from "./Pages/trainer/Trainer";
import Play from "./Pages/play/Play";
import Book from "./Pages/book/Book";
import VenueDetails from "./pages/book/venues/VenueDetails";
import CoachingDetails from "./pages/book/coaching/CoachingDetails";
import EventDetails from "./pages/book/events/EventDetails";
import MembershipDetails from "./pages/book/memberships/MembershipDetails";

function App() {
  return (
    <>
      {/* <BrowserRouter> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Play />} />
        <Route path="/venues" element={<Book />} />
        <Route path="/trainer" element={<Trainers />} />
        <Route path="/venues/venue/:id" element={<VenueDetails />} />
        <Route path="/venues/coaching/:id" element={<CoachingDetails />} />
        <Route path="/venues/event/:id" element={<EventDetails />} />
        <Route path="/venues/membership/:id" element={<MembershipDetails />} />
      </Routes>
      {/* </BrowserRouter> */}
    </>
  );
}

export default App;
