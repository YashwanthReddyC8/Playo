import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Clock, Link2, Users } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axios";
import { useAuthStore } from "../../stores/authStore";

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function JoinPlay() {
  const { joinCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/owners/bookings/play/${joinCode}`);
        setSession(response.data);
      } catch (error) {
        console.error("Failed to load play session", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [joinCode]);

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please login to join this game");
      navigate("/login");
      return;
    }

    if (!session?.joinCode) {
      toast.error("This invite link is invalid");
      return;
    }

    const userIdentifier = String(user.id || user.email || "");

    try {
      setJoining(true);
      let response;

      if ((session.playVisibility || "PRIVATE") === "PRIVATE") {
        response = await axiosInstance.post(`/api/owners/bookings/play/${session.joinCode}/join`, {
          userId: userIdentifier,
          email: String(user.email || ""),
          joinCode: session.joinCode,
        });
      } else {
        response = await axiosInstance.post(`/api/owners/bookings/play/${session.joinCode}/join`, {
          userId: userIdentifier,
          email: String(user.email || ""),
          joinCode: session.joinCode,
        });
      }

      setSession(response.data);
      if ((session.playVisibility || "PRIVATE") === "PRIVATE") {
        toast.success(`Joined via invite link. Share per player: ₹${Number(response.data.splitAmount || response.data.amount || 0).toFixed(2)}`);
      } else {
        toast.success("Join request sent. Waiting for host approval.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || (error?.response?.status === 409
        ? "Cannot join right now due to play rules"
        : "Unable to join this game right now");
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading invite...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Invite not found</h1>
          <p className="mt-2 text-sm text-gray-500">The join link may be expired or invalid.</p>
          <button onClick={() => navigate("/games")} className="mt-6 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const visibility = session.playVisibility || "PRIVATE";
  const maxPlayers = Number(session.maxPlayers) || 2;
  const joinedPlayers = Number(session.joinedPlayers) || 1;
  const isFull = joinedPlayers >= maxPlayers;
  const userIdentifier = String(user?.id || user?.email || "");
  const participantIds = Array.isArray(session.participantUserIds) ? session.participantUserIds.map(String) : [];
  const isAlreadyJoined = userIdentifier ? participantIds.includes(userIdentifier) : false;

  return (
    <div className="min-h-screen bg-[#F2F5F2] px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
              <Link2 size={14} /> Invite link
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-gray-900">{session.sportName || "Play Session"}</h1>
            <p className="mt-2 text-gray-500">{session.venueName || "Sports Center"}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${visibility === "PUBLIC" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {visibility}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <Calendar className="text-green-600" />
            <div className="mt-2 text-sm text-gray-500">Date</div>
            <div className="font-semibold text-gray-900">{formatDate(session.bookingDate)}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <Clock className="text-green-600" />
            <div className="mt-2 text-sm text-gray-500">Time</div>
            <div className="font-semibold text-gray-900">{session.timeSlot}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <Users className="text-green-600" />
            <div className="mt-2 text-sm text-gray-500">Players</div>
            <div className="font-semibold text-gray-900">{joinedPlayers}/{maxPlayers}</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">Money split</div>
          <p className="mt-1">Per player share: ₹{Number(session.splitAmount || session.amount || 0).toFixed(2)}</p>
          <p className="mt-1">Base booking amount: ₹{Number(session.amount || 0).toFixed(2)}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining || isFull}
            className="flex-1 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isFull
              ? "Game Full"
              : isAlreadyJoined
                ? "Already Joined"
                : joining
                  ? "Processing..."
                  : visibility === "PRIVATE"
                    ? "Join via Invite Link"
                    : "Request Join"}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(session.joinLink || window.location.href);
                toast.success("Invite link copied");
              } catch {
                toast.error("Could not copy invite link");
              }
            }}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Copy Invite Link
          </button>
        </div>
      </div>
    </div>
  );
}
