import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import HeroSearch from "./HeroSearch";
import Tabs from "./Tabs";
import TopCities from "./TopCities";

import VenuesList from "./venues/VenuesList";
import CoachingList from "./coaching/CoachingList";
import EventsList from "./events/EventsList";
import MembershipList from "./memberships/MembershipList";

import { venues } from "./venues/data";
import { coachingCenters } from "./coaching/data";
import { events } from "./events/data";
import { memberships } from "./memberships/data";

export default function Book() {
  const [activeTab, setActiveTab] = useState("venues");

  const counts = {
    venues: venues.length,
    coaching: coachingCenters.length,
    events: events.length,
    memberships: memberships.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSearch />

      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === "venues" && <VenuesList />}
        {activeTab === "coaching" && <CoachingList />}
        {activeTab === "events" && <EventsList />}
        {activeTab === "memberships" && <MembershipList />}
      </div>

      <TopCities />
      <Footer />
    </div>
  );
}
