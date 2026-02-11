import { useNavigate } from "react-router-dom";

export default function MembershipCard({ plan }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/venues/membership/${plan.id}`)}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden p-4 sm:p-6"
    >
      <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">{plan.name}</h3>
      <div className="text-green-600 font-bold mb-2">{plan.price}</div>
      <div className="text-sm text-gray-600">{plan.benefits}</div>
    </div>
  );
}
