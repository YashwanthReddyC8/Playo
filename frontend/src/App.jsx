import { Routes, Route } from "react-router-dom";
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
import Admin from "./Pages/admin/admin";
import Layout from "./layouts/Layout";
import { PlayerProtectedRoute, AdminProtectedRoute } from "./utils/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/games" element={<Play />} />
        <Route path="/venues" element={<Book />} />
        <Route path="/trainer" element={<Trainers />} />
        <Route path="/venues/venue/:id" element={<VenueDetails />} />
        <Route path="/venues/coaching/:id" element={<CoachingDetails />} />
        <Route path="/venues/event/:id" element={<EventDetails />} />
        <Route path="/venues/membership/:id" element={<MembershipDetails />} />
        <Route element={<PlayerProtectedRoute />}>
          <Route path="/myprofile" element={<Player />} />
        </Route>
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
