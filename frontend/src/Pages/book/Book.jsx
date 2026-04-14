import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../../components/Footer";
import axiosInstance from "../../api/axios";

import HeroSearch from "./HeroSearch";
import Tabs from "./Tabs";
import TopCities from "./TopCities";

import VenuesList from "./venues/VenuesList";
import CoachingList from "./coaching/CoachingList";
import EventsList from "./events/EventsList";
import MembershipList from "./memberships/MembershipList";

export default function Book() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("venues");
  const [heroSearchTerm, setHeroSearchTerm] = useState("");
  const querySport = searchParams.get("sport") || "All Sports";
  const [heroSportFilter, setHeroSportFilter] = useState(querySport);
  const [sportOptions, setSportOptions] = useState(["All Sports"]);
  const [venueCount, setVenueCount] = useState(0);

  useEffect(() => {
    setHeroSportFilter(querySport);
  }, [querySport]);

  useEffect(() => {
    axiosInstance.get("/api/owners/centers/public/all")
      .then((res) => {
        const centers = res.data || [];
        setVenueCount(centers.length);

        const sports = centers
          .flatMap((center) => Array.isArray(center?.facilities) ? center.facilities : [])
          .map((facility) => facility?.sportType)
          .filter(Boolean);

        const uniqueSports = Array.from(new Set(sports)).sort((a, b) => a.localeCompare(b));
        setSportOptions(["All Sports", ...uniqueSports]);
      })
      .catch(() => {
        setVenueCount(0);
        setSportOptions(["All Sports"]);
      });
  }, []);

  const counts = {
    venues: venueCount,
    coaching: 0,
    events: 0,
    memberships: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSearch 
        onSearchChange={setHeroSearchTerm}
        onSportFilter={setHeroSportFilter}
        sportOptions={sportOptions}
        currentSport={heroSportFilter}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === "venues" && (
          <VenuesList 
            initialSearchTerm={heroSearchTerm}
            initialSportFilter={heroSportFilter}
          />
        )}
        {activeTab === "coaching" && <CoachingList />}
        {activeTab === "events" && <EventsList />}
        {activeTab === "memberships" && <MembershipList />}
      </div>

      <TopCities />
      <Footer />
    </div>
  );
}
