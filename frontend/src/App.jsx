import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import "./App.css";
import Trainers from "./Pages/trainer/Trainer";
import Play from "./Pages/play/Play";
import Book from "./Pages/book/Book";
import VenueDetails from "./Pages/book/venues/VenueDetails";
import CoachingDetails from "./Pages/book/coaching/CoachingDetails";
import EventDetails from "./Pages/book/events/EventDetails";
import MembershipDetails from "./Pages/book/memberships/MembershipDetails";
import Player from "./Pages/player/Player";
import Layout from "./layouts/Layout";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />
      {/* All layout pages */}
      <Route element={<Layout />}>
        <Route path="/games" element={<Play />} />
        <Route path="/venues" element={<Book />} />
        <Route path="/trainer" element={<Trainers />} />
        <Route path="/venues/venue/:id" element={<VenueDetails />} />
        <Route path="/venues/coaching/:id" element={<CoachingDetails />} />
        <Route path="/venues/event/:id" element={<EventDetails />} />
        <Route path="/venues/membership/:id" element={<MembershipDetails />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/myprofile" element={<Player />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;
