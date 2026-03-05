import { useMemo, useState } from "react";

const initialApplications = [
    {
        id: "APP-1021",
        ownerName: "Aarav Sports LLP",
        centerName: "Aarav Turf Arena",
        city: "Hyderabad",
        submittedAt: "2026-03-03",
        status: "pending",
    },
    {
        id: "APP-1022",
        ownerName: "Smash Point",
        centerName: "Smash Point Badminton",
        city: "Bengaluru",
        submittedAt: "2026-03-04",
        status: "pending",
    },
    {
        id: "APP-1023",
        ownerName: "Urban Kick Sports",
        centerName: "Urban Kick Box Cricket",
        city: "Pune",
        submittedAt: "2026-03-05",
        status: "approved",
    },
];

const initialCenters = [
    { id: "CTR-209", name: "Aarav Turf Arena", city: "Hyderabad", state: "active" },
    { id: "CTR-210", name: "Smash Point Badminton", city: "Bengaluru", state: "under_review" },
    { id: "CTR-211", name: "Urban Kick Box Cricket", city: "Pune", state: "active" },
];

const reviewQueue = [
    { id: "RV-11", user: "Rahul V", center: "Urban Kick Box Cricket", rating: 2, comment: "Lights were dim in court 3." },
    { id: "RV-12", user: "Meera S", center: "Aarav Turf Arena", rating: 5, comment: "Great turf and smooth booking." },
];

const userAccounts = [
    { id: "USR-51", name: "Rohit Sharma", role: "player", status: "active" },
    { id: "USR-52", name: "Ananya Rao", role: "owner", status: "active" },
    { id: "USR-53", name: "Kiran Verma", role: "owner", status: "suspended" },
];

export default function Admin() {
    const [applications, setApplications] = useState(initialApplications);
    const [centers, setCenters] = useState(initialCenters);

    const metrics = useMemo(() => {
        const pendingApplications = applications.filter((item) => item.status === "pending").length;
        const approvedApplications = applications.filter((item) => item.status === "approved").length;
        const activeCenters = centers.filter((item) => item.state === "active").length;

        return {
            pendingApplications,
            approvedApplications,
            activeCenters,
            reviewQueueCount: reviewQueue.length,
        };
    }, [applications, centers]);

    const updateApplicationStatus = (applicationId, nextStatus) => {
        setApplications((prev) =>
            prev.map((item) =>
                item.id === applicationId
                    ? {
                        ...item,
                        status: nextStatus,
                    }
                    : item
            )
        );
    };

    const updateCenterState = (centerId, nextState) => {
        setCenters((prev) =>
            prev.map((item) =>
                item.id === centerId
                    ? {
                        ...item,
                        state: nextState,
                    }
                    : item
            )
        );
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
                {/* <h1 className="text-3xl font-bold">Admin Portal</h1> */}
                <p className="mt-2 text-sm text-slate-200">
                    Manage center applications, sports centers, user accounts, and review moderation.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">Pending Applications</p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">{metrics.pendingApplications}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">Approved Applications</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">{metrics.approvedApplications}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">Active Sports Centers</p>
                    <p className="mt-2 text-2xl font-bold text-blue-600">{metrics.activeCenters}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">Review Queue</p>
                    <p className="mt-2 text-2xl font-bold text-purple-600">{metrics.reviewQueueCount}</p>
                </div>
            </div>

            <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Center Applications</h2>
                    <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                        Export Applications
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Application ID</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Owner</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Center</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">City</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applications.map((application) => (
                                <tr key={application.id}>
                                    <td className="px-3 py-3 text-sm text-gray-700">{application.id}</td>
                                    <td className="px-3 py-3 text-sm text-gray-700">{application.ownerName}</td>
                                    <td className="px-3 py-3 text-sm text-gray-700">{application.centerName}</td>
                                    <td className="px-3 py-3 text-sm text-gray-700">{application.city}</td>
                                    <td className="px-3 py-3 text-sm text-gray-700">{application.submittedAt}</td>
                                    <td className="px-3 py-3 text-sm">
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700">
                                            {application.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right text-sm">
                                        <div className="inline-flex gap-2">
                                            <button
                                                onClick={() => updateApplicationStatus(application.id, "approved")}
                                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateApplicationStatus(application.id, "rejected")}
                                                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="text-xl font-semibold text-gray-900">Manage Sports Centers</h2>
                    <div className="mt-4 space-y-3">
                        {centers.map((center) => (
                            <div key={center.id} className="rounded-lg border border-gray-100 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-gray-900">{center.name}</p>
                                        <p className="text-sm text-gray-500">{center.city} � {center.id}</p>
                                    </div>
                                    <select
                                        value={center.state}
                                        onChange={(event) => updateCenterState(center.id, event.target.value)}
                                        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* <div className="hidden rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="text-xl font-semibold text-gray-900">User Account Control</h2>
                    <div className="mt-4 space-y-3">
                        {userAccounts.map((account) => (
                            <div key={account.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                                <div>
                                    <p className="font-medium text-gray-900">{account.name}</p>
                                    <p className="text-sm text-gray-500">{account.role} � {account.id}</p>
                                </div>
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700">
                                    {account.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div> */}
            </section>

            <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Review Moderation</h2>
                    <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                        Export Reviews
                    </button>
                </div>

                <div className="space-y-3">
                    {reviewQueue.map((review) => (
                        <div key={review.id} className="rounded-lg border border-gray-100 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-medium text-gray-900">{review.user} � {review.center}</p>
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                                    Rating: {review.rating}/5
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                            <div className="mt-3 flex gap-2">
                                <button className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">
                                    Respond
                                </button>
                                <button className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                                    Flag
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
