import { useParams } from "react-router-dom";

export default function EventDetails() {
  const { id } = useParams();

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mt-4">Event Details</h1>
      <p className="text-gray-500">Event ID: {id}</p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
        Event details will be shown here once the backend events API is connected.
      </div>
    </div>
  );
}
