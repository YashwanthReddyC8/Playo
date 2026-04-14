import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import AdminDashboard from "./Pages/AdminDashboard";
import CenterApplications from "./Pages/CenterApplications";
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
import Owner from "./Pages/owner/owner";
import Layout from "./layouts/Layout";
import { PlayerProtectedRoute, AdminProtectedRoute, OwnerProtectedRoute } from "./utils/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";

function App() {
  const { initAuth, setupSessionListener } = useAuthStore();

  useEffect(() => {
    initAuth();
    const unsubscribe = setupSessionListener();
    return unsubscribe;
  }, [initAuth, setupSessionListener]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<Layout />}>
        <Route path="/games" element={<Play />} />
        <Route path="/venues" element={<Book />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/myprofile" element={<Player />} />
        <Route path="/venues/venue/:id" element={<VenueDetails />} />
        <Route path="/venues/coaching/:id" element={<CoachingDetails />} />
        <Route path="/venues/event/:id" element={<EventDetails />} />
        <Route path="/venues/membership/:id" element={<MembershipDetails />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route element={<OwnerProtectedRoute />}>
          <Route path="/owner" element={<Owner />} />
        </Route>
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-dashboard/applications" element={<CenterApplications />} />
      <Route path="/center-applications" element={<CenterApplications />} />
    </Routes>
  );
}

export default App;
