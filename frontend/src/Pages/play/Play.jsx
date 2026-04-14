import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Link2, Trophy, MapPin, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axios";
import { useAuthStore } from "../../stores/authStore";

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDisplayName = (identifier) => {
  const raw = String(identifier || "").trim();
  if (!raw) return "Player";
  if (/^\d+$/.test(raw)) {
    return `Player ${raw}`;
  }
  const base = raw.includes("@") ? raw.split("@")[0] : raw;
  return base
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeSportName = (sportName) => {
  const raw = String(sportName || "").trim();
  if (!raw || raw.toLowerCase() === "unknown sport" || raw.toLowerCase() === "unknown") {
    return "General Sport";
  }
  return raw;
};

function SessionCard({ session, onJoin, onCopyLink, onViewDetails, onManagePlay, onDeletePlay, currentUserId, currentUserEmail }) {
  const visibility = session.playVisibility || "PRIVATE";
  const maxPlayers = Number(session.maxPlayers) || 2;
  const joinedPlayers = Number(session.joinedPlayers) || 1;
  const shareAmount = session.splitAmount || session.amount;
  const isPublic = visibility === "PUBLIC";
  const isFull = joinedPlayers >= maxPlayers;
  const participantIds = Array.isArray(session.participantUserIds) ? session.participantUserIds.map(String) : [];
  const pendingInviteIds = Array.isArray(session.pendingInviteUserIds) ? session.pendingInviteUserIds.map(String) : [];
  const pendingRequestIds = Array.isArray(session.pendingJoinRequestUserIds) ? session.pendingJoinRequestUserIds.map(String) : [];
  const normalizedCurrentUserId = currentUserId ? String(currentUserId) : "";
  const normalizedCurrentUserEmail = currentUserEmail ? String(currentUserEmail) : "";
  const isAlreadyJoined = normalizedCurrentUserId ? participantIds.includes(normalizedCurrentUserId) : false;
  const hasPendingInvite = (normalizedCurrentUserId && pendingInviteIds.includes(normalizedCurrentUserId))
    || (normalizedCurrentUserEmail && pendingInviteIds.some((value) => value.toLowerCase() === normalizedCurrentUserEmail.toLowerCase()));
  const hasPendingRequest = normalizedCurrentUserId ? pendingRequestIds.includes(normalizedCurrentUserId) : false;
  const isHost = currentUserId && String(session.hostUserId) === String(currentUserId);
  const isPrivate = !isPublic;

  let ctaLabel = "Request Join";
  if (isHost) {
    ctaLabel = "You are Host";
  } else if (isAlreadyJoined) {
    ctaLabel = "Already Joined";
  } else if (isFull) {
    ctaLabel = "Game Full";
  } else if (hasPendingInvite) {
    ctaLabel = "Accept Invite";
  } else if (hasPendingRequest) {
    ctaLabel = "Request Pending";
  } else if (isPrivate) {
    ctaLabel = "Invite Only";
  }

  const isPrimaryDisabled = isHost || isAlreadyJoined || isFull || hasPendingRequest || (isPrivate && !hasPendingInvite);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-green-700">
            <Trophy size={14} />
            {normalizeSportName(session.sportName) || "Play"}
          </div>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{session.venueName || "Sports Center"}</h3>
          <p className="text-sm text-gray-500">{formatDate(session.bookingDate)} • {session.timeSlot}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isPublic ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
          {visibility}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-gray-500">Players</div>
          <div className="mt-1 font-semibold text-gray-900 flex items-center gap-1">
            <Users size={16} />
            {joinedPlayers}/{maxPlayers}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-gray-500">Split</div>
          <div className="mt-1 font-semibold text-gray-900">₹{Number(shareAmount || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin size={16} />
        <span>{session.joinLink ? "Shareable invite available" : "Public session"}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onJoin(session)}
          className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          disabled={isPrimaryDisabled}
        >
          {ctaLabel}
        </button>
        <button
          type="button"
          onClick={() => onCopyLink(session)}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-2">
            <Link2 size={16} />
            Copy Link
          </span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(session)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          View Details
        </button>
        {isHost && (
          <>
            <button
              type="button"
              onClick={() => onManagePlay(session)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Manage Play
            </button>
            <button
              type="button"
              onClick={() => onDeletePlay(session)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Delete Play
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Play() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUserId = String(user?.id || user?.email || "");
  const currentUserEmail = String(user?.email || "").toLowerCase();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyPublic, setOnlyPublic] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [manageMode, setManageMode] = useState(false);
  const [participantInput, setParticipantInput] = useState("");
  const [splitDraft, setSplitDraft] = useState({});

  const getDisplayName = (identifier) => {
    const raw = String(identifier || "").trim();
    if (!raw) return "Player";

    if ((currentUserId && raw === currentUserId)
      || (currentUserEmail && raw.toLowerCase() === currentUserEmail)) {
      return String(user?.name || "You");
    }

    return toDisplayName(raw);
  };

  const invitedSessions = useMemo(() => {
    const id = String(user?.id || "");
    const email = String(user?.email || "").toLowerCase();

    return sessions.filter((session) => {
      const pendingInvites = Array.isArray(session.pendingInviteUserIds) ? session.pendingInviteUserIds : [];
      const participants = Array.isArray(session.participantUserIds) ? session.participantUserIds : [];

      const invited = pendingInvites.some((value) => {
        const raw = String(value || "").trim();
        return (id && raw === id) || (email && raw.toLowerCase() === email);
      });

      const alreadyJoined = participants.some((value) => {
        const raw = String(value || "").trim();
        return (id && raw === id) || (email && raw.toLowerCase() === email);
      });

      return invited && !alreadyJoined;
    });
  }, [sessions, user?.id, user?.email]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const requests = [];

      requests.push(
        axiosInstance.get("/api/owners/bookings/play/visible", {
          params: currentUserId || currentUserEmail ? {
            viewerUserId: currentUserId,
            viewerEmail: user?.email || "",
          } : {},
        })
      );

      if (currentUserId) {
        requests.push(axiosInstance.get(`/api/owners/bookings/user/${encodeURIComponent(currentUserId)}`));
      }

      const responses = await Promise.allSettled(requests);
      const visibleSessions = responses[0].status === "fulfilled" && Array.isArray(responses[0].value.data)
        ? responses[0].value.data
        : [];
      const ownBookings = responses[1] && responses[1].status === "fulfilled" && Array.isArray(responses[1].value.data)
        ? responses[1].value.data
        : [];

      const ownPlayBookings = ownBookings.filter((booking) => Boolean(booking.playEnabled));
      const merged = [...visibleSessions, ...ownPlayBookings].reduce((accumulator, session) => {
        if (!session?.id) return accumulator;
        accumulator.set(String(session.id), session);
        return accumulator;
      }, new Map());

      setSessions(Array.from(merged.values()));
    } catch (error) {
      console.error("Failed to fetch play sessions", error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentUserId]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const haystack = [session.venueName, session.sportName, session.timeSlot, session.playVisibility]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      const matchesVisibility = !onlyPublic || (session.playVisibility || "PRIVATE") === "PUBLIC";
      return matchesSearch && matchesVisibility;
    });
  }, [onlyPublic, search, sessions]);

  const handleJoin = async (session) => {
    if (!user) {
      toast.error("Please login to join a game");
      navigate("/login");
      return;
    }

    if (!session.joinCode) {
      toast.error("Join link is unavailable for this session");
      return;
    }

    try {
      let response;
      const userIdentifier = String(user.id || user.email || "");
      const pendingInviteIds = Array.isArray(session.pendingInviteUserIds) ? session.pendingInviteUserIds.map(String) : [];
      const hasPendingInvite = pendingInviteIds.includes(userIdentifier);

      if ((session.playVisibility || "PRIVATE") === "PRIVATE" && hasPendingInvite) {
        response = await axiosInstance.post(`/api/owners/bookings/${session.id}/play/invitations/accept`, {
          userId: userIdentifier,
          email: String(user.email || ""),
        });
        toast.success("Invite accepted. You have joined this private play.");
      } else {
        response = await axiosInstance.post(`/api/owners/bookings/play/${session.joinCode}/join`, {
          userId: userIdentifier,
          email: String(user.email || ""),
          joinCode: session.joinCode,
        });
        toast.success("Join request sent. Waiting for host approval.");
      }

      setSessions((current) => current.map((item) => (item.id === response.data.id ? response.data : item)));
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to join this game right now";
      toast.error(message);
    }
  };

  const handleCopyLink = async (session) => {
    if (!session.joinLink) {
      toast.error("Join link is unavailable for this session");
      return;
    }

    try {
      await navigator.clipboard.writeText(session.joinLink);
      toast.success("Join link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setManageMode(false);
    setSplitDraft(session.paymentSplitPercentages || {});
  };

  const handleManagePlay = (session) => {
    setSelectedSession(session);
    setManageMode(true);
    setSplitDraft(session.paymentSplitPercentages || {});
  };

  const syncUpdatedSession = (updatedSession) => {
    if (!updatedSession) return;
    setSessions((current) => current.map((session) => (
      String(session.id) === String(updatedSession.id) ? updatedSession : session
    )));
    setSelectedSession((currentSelected) => (
      currentSelected && String(currentSelected.id) === String(updatedSession.id)
        ? updatedSession
        : currentSelected
    ));
    setSplitDraft(updatedSession.paymentSplitPercentages || {});
  };

  const handleDeletePlay = async (session) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!window.confirm("Delete this play?")) {
      return;
    }

    try {
      await axiosInstance.post(`/api/owners/bookings/${session.id}/play/disable`, {
        hostUserId: currentUserId,
      });
      toast.success("Play deleted");
      setSelectedSession(null);
      await fetchSessions();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to delete play";
      toast.error(message);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedSession) return;
    const participantUserId = participantInput.trim();
    if (!participantUserId) {
      toast.error("Enter participant email or user ID");
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/owners/bookings/${selectedSession.id}/play/participants`, {
        hostUserId: currentUserId,
        participantUserId,
      });
      syncUpdatedSession(response.data);
      setParticipantInput("");
      toast.success("Invite sent. Participant must accept to join.");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to add participant";
      toast.error(message);
    }
  };

  const handleApproveJoinRequest = async (sessionId, requestUserId) => {
    if (!sessionId || !requestUserId) return;

    try {
      const response = await axiosInstance.post(
        `/api/owners/bookings/${sessionId}/play/requests/${encodeURIComponent(requestUserId)}/approve`,
        { hostUserId: currentUserId }
      );
      syncUpdatedSession(response.data);
      toast.success("Join request approved");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to approve join request";
      toast.error(message);
    }
  };

  const handleRejectJoinRequest = async (sessionId, requestUserId) => {
    if (!sessionId || !requestUserId) return;

    try {
      const response = await axiosInstance.post(
        `/api/owners/bookings/${sessionId}/play/requests/${encodeURIComponent(requestUserId)}/reject`,
        { hostUserId: currentUserId }
      );
      syncUpdatedSession(response.data);
      toast.success("Join request rejected");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to reject join request";
      toast.error(message);
    }
  };

  const handleRemoveParticipant = async (participantUserId) => {
    if (!selectedSession) return;

    try {
      const response = await axiosInstance.post(
        `/api/owners/bookings/${selectedSession.id}/play/participants/${encodeURIComponent(participantUserId)}/remove`,
        { hostUserId: currentUserId }
      );
      syncUpdatedSession(response.data);
      toast.success("Participant removed");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to remove participant";
      toast.error(message);
    }
  };

  const handleSaveSplit = async () => {
    if (!selectedSession) return;

    try {
      const payload = Object.fromEntries(
        Object.entries(splitDraft || {}).map(([participantId, value]) => [participantId, Number(value)])
      );

      const response = await axiosInstance.put(`/api/owners/bookings/${selectedSession.id}/play/split`, {
        hostUserId: currentUserId,
        splitPercentages: payload,
      });
      syncUpdatedSession(response.data);
      toast.success("Split updated");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update split";
      toast.error(message);
    }
  };

  const handleAcceptInviteFromDashboard = async (session) => {
    if (!session?.id) return;

    try {
      const response = await axiosInstance.post(`/api/owners/bookings/${session.id}/play/invitations/accept`, {
        userId: String(user?.id || user?.email || ""),
        email: String(user?.email || ""),
      });
      syncUpdatedSession(response.data);
      toast.success("Invite accepted. You joined the play.");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to accept invite";
      toast.error(message);
    }
  };

  const joinRequestNotifications = useMemo(() => {
    return sessions
      .filter((session) => String(session.hostUserId) === String(currentUserId))
      .flatMap((session) => {
        const requests = Array.isArray(session.pendingJoinRequestUserIds)
          ? session.pendingJoinRequestUserIds
          : [];

        return requests.map((requestUserId) => ({
          sessionId: session.id,
          requestUserId,
          venueName: session.venueName || "Sports Center",
          sportName: normalizeSportName(session.sportName),
          bookingDate: session.bookingDate,
          timeSlot: session.timeSlot,
        }));
      });
  }, [sessions, currentUserId]);

  return (
    <div className="min-h-screen bg-[#F2F5F2]">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-green-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                <Users size={14} /> Play
              </p>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">Join public matches or open your private invite</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                Public sessions can be joined by anyone and split automatically. Private sessions stay hidden unless you share the invite link.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/myprofile")}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Add Court Booking to Play
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/venues")}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Create a New Booking
                </button>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
              <div className="font-semibold">{filteredSessions.length} sessions available</div>
              <div className="text-white/70">Split money, manage invites, and play together.</div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
            placeholder="Search by sport, venue, or time"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={onlyPublic}
              onChange={(e) => setOnlyPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Show public only (hide private)
          </label>
        </div>

        {invitedSessions.length > 0 && (
          <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800">You Are Invited</h2>
              <span className="rounded-full bg-blue-200 px-2 py-1 text-xs font-semibold text-blue-900">{invitedSessions.length}</span>
            </div>
            <div className="space-y-2">
              {invitedSessions.map((session) => (
                <div key={`invite-${session.id}`} className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{normalizeSportName(session.sportName)} at {session.venueName || "Sports Center"}</p>
                    <p className="text-xs text-gray-600">{formatDate(session.bookingDate)} • {session.timeSlot}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAcceptInviteFromDashboard(session)}
                    className="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Click To Join
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {joinRequestNotifications.length > 0 && (
          <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-amber-800">Join Request Notifications</h2>
              <span className="rounded-full bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-900">
                {joinRequestNotifications.length} pending
              </span>
            </div>
            <div className="space-y-2">
              {joinRequestNotifications.map((item) => (
                <div
                  key={`notify-${item.sessionId}-${item.requestUserId}`}
                  className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{toDisplayName(item.requestUserId)} requested to join</p>
                    <p className="text-xs text-gray-600">
                      {item.sportName} at {item.venueName} • {formatDate(item.bookingDate)} • {item.timeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApproveJoinRequest(item.sessionId, item.requestUserId)}
                      className="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectJoinRequest(item.sessionId, item.requestUserId)}
                      className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No play sessions found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onJoin={handleJoin}
                onCopyLink={handleCopyLink}
                onViewDetails={handleViewDetails}
                onManagePlay={handleManagePlay}
                onDeletePlay={handleDeletePlay}
                currentUserId={user?.id || user?.email || null}
                currentUserEmail={user?.email || null}
              />
            ))}
          </div>
        )}

        {selectedSession && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Play Details</h3>
                  <p className="text-sm text-gray-500">{selectedSession.venueName} • {selectedSession.timeSlot}</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-gray-200 p-3">
                  <p><span className="font-semibold">Host:</span> {getDisplayName(selectedSession.hostUserId)}</p>
                  <p><span className="font-semibold">Visibility:</span> {selectedSession.playVisibility}</p>
                  <p><span className="font-semibold">Players:</span> {selectedSession.joinedPlayers}/{selectedSession.maxPlayers}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="font-semibold mb-2">Split Percentages</p>
                  <div className="space-y-1">
                    {(selectedSession.participantUserIds || []).map((participantId) => (
                      <div key={`detail-${participantId}`} className="flex items-center justify-between text-xs">
                        <span>{getDisplayName(participantId)}</span>
                        <span>{splitDraft?.[participantId] ?? selectedSession.paymentSplitPercentages?.[participantId] ?? 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-3">
                <p className="font-semibold mb-2">Participants</p>
                <div className="space-y-2">
                  {(selectedSession.participantUserIds || []).map((participantId) => {
                    const isHost = String(participantId) === String(selectedSession.hostUserId);
                    const canManage = manageMode && currentUserId === String(selectedSession.hostUserId);

                    return (
                      <div key={`participant-${participantId}`} className="flex items-center justify-between rounded border px-2 py-1">
                        <span className="text-xs">{getDisplayName(participantId)}{isHost ? " (Host)" : ""}</span>
                        {canManage && !isHost && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(participantId)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {manageMode && currentUserId === String(selectedSession.hostUserId) && (
                <div className="mt-4 space-y-4 rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                  <p className="font-semibold text-sm">Manage Play</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={participantInput}
                      onChange={(event) => setParticipantInput(event.target.value)}
                      placeholder="Participant email or user ID"
                      className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Update Split (%)</p>
                    {(selectedSession.participantUserIds || []).map((participantId) => (
                      <div key={`split-input-${participantId}`} className="flex items-center gap-2">
                        <span className="w-1/2 text-xs truncate">{getDisplayName(participantId)}</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={splitDraft?.[participantId] ?? selectedSession.paymentSplitPercentages?.[participantId] ?? ""}
                          onChange={(event) => setSplitDraft((current) => ({
                            ...current,
                            [participantId]: event.target.value,
                          }))}
                          className="w-1/2 rounded border border-gray-200 px-2 py-1 text-xs"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleSaveSplit}
                      className="rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Save Split
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Pending Public Join Requests</p>
                    {Array.isArray(selectedSession.pendingJoinRequestUserIds) && selectedSession.pendingJoinRequestUserIds.length > 0 ? (
                      selectedSession.pendingJoinRequestUserIds.map((requestUserId) => (
                        <div key={`request-${requestUserId}`} className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2">
                          <span className="text-xs truncate">{getDisplayName(requestUserId)}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleApproveJoinRequest(selectedSession.id, requestUserId)}
                              className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectJoinRequest(selectedSession.id, requestUserId)}
                              className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No pending requests.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900">How play works</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-4">
              <Calendar className="text-green-600" />
              <h3 className="mt-3 font-semibold">Create a booking</h3>
              <p className="mt-1 text-sm text-gray-600">Choose Public to let others join and split the cost, or Private to keep it invite-only.</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <Link2 className="text-green-600" />
              <h3 className="mt-3 font-semibold">Share the link</h3>
              <p className="mt-1 text-sm text-gray-600">Private sessions generate a join link that you can send to your friends directly.</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <Clock className="text-green-600" />
              <h3 className="mt-3 font-semibold">Join and play</h3>
              <p className="mt-1 text-sm text-gray-600">Players can join public games or use the invite link for private sessions before the slot fills up.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
