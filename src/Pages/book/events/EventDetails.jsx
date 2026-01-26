import { useParams } from "react-router-dom";
import { events } from "./data";

export default function EventDetails() {
  const { id } = useParams();
  const event = events.find((e) => e.id === Number(id));

  if (!event) return <div className="p-6 sm:p-10">Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <img src={event.image} className="w-full aspect-[16/9] object-cover rounded-xl" />
      <h1 className="text-xl sm:text-2xl font-bold mt-4">{event.title}</h1>
      <p className="text-gray-500">{event.location}</p>
      <p className="mt-2">{event.date}</p>
      <button className="mt-6 bg-green-600 text-white px-5 sm:px-6 py-3 rounded-lg">Register</button>
    </div>
  );
}
