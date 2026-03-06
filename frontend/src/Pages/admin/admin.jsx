import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axios";

export default function Admin() {
  const [applications, setApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [queuePage, setQueuePage] = useState(0);
  const [approvedPage, setApprovedPage] = useState(0);
  const pageSize = 10;

  const [queueTotalPages, setQueueTotalPages] = useState(0);
  const [approvedTotalPages, setApprovedTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adminBasic = import.meta.env.VITE_ADMIN_BASIC_AUTH || "admin:admin";
  const adminHeaders = {
    Authorization: `Basic ${btoa(adminBasic)}`,
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const [queueRes, approvedRes, rejectedRes, pendingRes] = await Promise.all([
        axiosInstance.get("/api/admin/center-applications", {
          params: { page: queuePage, size: pageSize },
          headers: adminHeaders,
        }),
        axiosInstance.get("/api/admin/center-applications", {
          params: { page: approvedPage, size: pageSize, status: "APPROVED" },
          headers: adminHeaders,
        }),
        axiosInstance.get("/api/admin/center-applications", {
          params: { page: 0, size: 1, status: "REJECTED" },
          headers: adminHeaders,
        }),
        axiosInstance.get("/api/admin/center-applications", {
          params: { page: 0, size: 1, status: "PENDING" },
          headers: adminHeaders,
        }),
      ]);

      const queueContent = queueRes.data?.content || [];
      const onlyQueue = queueContent.filter((item) => item.status !== "APPROVED");

      setApplications(onlyQueue);
      setQueueTotalPages(queueRes.data?.totalPages || 0);

      setApprovedApplications(approvedRes.data?.content || []);
      setApprovedTotalPages(approvedRes.data?.totalPages || 0);

      setAnalytics({
        total: queueRes.data?.totalElements || 0,
        approved: approvedRes.data?.totalElements || 0,
        rejected: rejectedRes.data?.totalElements || 0,
        pending: pendingRes.data?.totalElements || 0,
      });
    } catch (apiError) {
      console.error("Failed to load applications:", apiError);
      setError("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [queuePage, approvedPage]);

  const metrics = useMemo(() => {
    return {
      pendingCount: analytics.pending,
      rejectedCount: analytics.rejected,
      approvedCount: analytics.approved,
      totalVisible: analytics.total,
    };
  }, [analytics]);

  const updateApplicationStatus = async (applicationId, nextStatus) => {
    try {
      await axiosInstance.patch(
        `/api/admin/center-applications/${applicationId}/status`,
        { status: nextStatus, reviewNotes: `Updated to ${nextStatus} from admin panel` },
        { headers: adminHeaders }
      );
      await loadApplications();
    } catch (apiError) {
      console.error("Failed to update application status:", apiError);
    }
  };

  const viewApplication = async (applicationId) => {
    try {
      const response = await axiosInstance.get(
        `/api/admin/center-applications/${applicationId}`,
        { headers: adminHeaders }
      );

      setSelectedApplication(response.data);
      setIsViewModalOpen(true);
    } catch (apiError) {
      console.error("Failed to fetch application details:", apiError);
    }
  };

  const deleteApplication = async (applicationId) => {
    try {
      await axiosInstance.delete(`/api/admin/center-applications/${applicationId}`, {
        headers: adminHeaders,
      });
      await loadApplications();
    } catch (apiError) {
      console.error("Failed to delete application:", apiError);
    }
  };

  const exportCsv = (rows, fileName) => {
    if (!rows.length) {
      return;
    }

    const headers = [
      "id",
      "name",
      "email",
      "phoneNumber",
      "sportsCenterName",
      "city",
      "state",
      "status",
      "createdAt",
      "reviewedBy",
      "reviewedAt",
      "reviewNotes",
    ];

    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((key) => {
            const value = row[key] ?? "";
            const escaped = String(value).replaceAll('"', '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
        <p className="mt-2 text-sm text-slate-200">
          Manage center applications and moderation workflow.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Overall Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{metrics.pendingCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Overall Rejected</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{metrics.rejectedCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Overall Approved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{metrics.approvedCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Overall Total</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{metrics.totalVisible}</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Pending / Rejected Applications</h2>
          <button
            onClick={() => exportCsv(applications, "queue-applications.csv")}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          >
            Export Queue
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Owner</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Center</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">City</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-3 text-sm text-gray-500">
                    Loading applications...
                  </td>
                </tr>
              )}

              {!loading && applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-3 text-sm text-gray-500">
                    No pending/rejected applications found.
                  </td>
                </tr>
              )}

              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.id}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.name}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.sportsCenterName}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.city}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.createdAt?.slice(0, 10)}</td>
                  <td className="px-3 py-3 text-sm">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700">
                      {(application.status || "").toLowerCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => viewApplication(application.id)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, "APPROVED")}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, "REJECTED")}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => deleteApplication(application.id)}
                        className="rounded-md border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            disabled={queuePage === 0}
            onClick={() => setQueuePage((prev) => Math.max(prev - 1, 0))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {queuePage + 1}{queueTotalPages ? ` of ${queueTotalPages}` : ""}</span>
          <button
            disabled={queueTotalPages > 0 ? queuePage >= queueTotalPages - 1 : applications.length < pageSize}
            onClick={() => setQueuePage((prev) => prev + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Approved Applications</h2>
          <button
            onClick={() => exportCsv(approvedApplications, "approved-applications.csv")}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          >
            Export Approved
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Owner</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Center</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">City</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reviewed By</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && approvedApplications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-sm text-gray-500">
                    No approved applications found.
                  </td>
                </tr>
              )}

              {approvedApplications.map((application) => (
                <tr key={application.id}>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.id}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.name}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.sportsCenterName}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.city}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{application.reviewedBy || "-"}</td>
                  <td className="px-3 py-3 text-right text-sm">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => viewApplication(application.id)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, "REJECTED")}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Mark Rejected
                      </button>
                      <button
                        onClick={() => deleteApplication(application.id)}
                        className="rounded-md border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            disabled={approvedPage === 0}
            onClick={() => setApprovedPage((prev) => Math.max(prev - 1, 0))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {approvedPage + 1}{approvedTotalPages ? ` of ${approvedTotalPages}` : ""}</span>
          <button
            disabled={approvedTotalPages > 0 ? approvedPage >= approvedTotalPages - 1 : approvedApplications.length < pageSize}
            onClick={() => setApprovedPage((prev) => prev + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>

      {isViewModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedApplication(null);
                }}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
              <p><span className="font-semibold">ID:</span> {selectedApplication.id}</p>
              <p><span className="font-semibold">Status:</span> {selectedApplication.status}</p>
              <p><span className="font-semibold">Name:</span> {selectedApplication.name}</p>
              <p><span className="font-semibold">Center:</span> {selectedApplication.sportsCenterName}</p>
              <p><span className="font-semibold">Email:</span> {selectedApplication.email}</p>
              <p><span className="font-semibold">Phone:</span> {selectedApplication.phoneNumber}</p>
              <p><span className="font-semibold">City:</span> {selectedApplication.city}</p>
              <p><span className="font-semibold">State:</span> {selectedApplication.state}</p>
              <p><span className="font-semibold">Zip:</span> {selectedApplication.zipCode}</p>
              <p><span className="font-semibold">Business Email:</span> {selectedApplication.businessEmail}</p>
              <p><span className="font-semibold">Business Phone:</span> {selectedApplication.businessPhoneNumber}</p>
              <p><span className="font-semibold">Reviewed By:</span> {selectedApplication.reviewedBy || "-"}</p>
              <p><span className="font-semibold">Reviewed At:</span> {selectedApplication.reviewedAt || "-"}</p>
              <p className="md:col-span-2"><span className="font-semibold">Address:</span> {selectedApplication.streetAddress}</p>
              <p className="md:col-span-2"><span className="font-semibold">Map Link:</span> {selectedApplication.googleMapLink || "-"}</p>
              <p className="md:col-span-2"><span className="font-semibold">Description:</span> {selectedApplication.centerDescription || "-"}</p>
              <p className="md:col-span-2"><span className="font-semibold">Review Notes:</span> {selectedApplication.reviewNotes || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
