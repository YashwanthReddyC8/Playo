import { useParams } from "react-router-dom";

export default function CoachingDetails() {
  const { id } = useParams();

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mt-4">Coaching Details</h1>
      <p className="text-gray-500">Coaching center ID: {id}</p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
        Coaching details will be shown here once the backend coaching API is connected.
      </div>
    </div>
  );
}
