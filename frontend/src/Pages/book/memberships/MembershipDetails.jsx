import { useParams } from "react-router-dom";

export default function MembershipDetails() {
  const { id } = useParams();

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Membership Details</h1>
      <p className="text-gray-500">Plan ID: {id}</p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
        Membership details will be shown here once the backend memberships API is connected.
      </div>
    </div>
  );
}
