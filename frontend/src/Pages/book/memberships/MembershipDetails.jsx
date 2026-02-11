import { useParams } from "react-router-dom";
import { memberships } from "./data";

export default function MembershipDetails() {
  const { id } = useParams();
  const plan = memberships.find((m) => m.id === Number(id));

  if (!plan) return <div className="p-6 sm:p-10">Not Found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold">{plan.name}</h1>
      <div className="text-green-600 text-xl font-semibold mt-2">{plan.price}</div>
      <p className="mt-4 text-gray-700">{plan.benefits}</p>
      <button className="mt-6 bg-green-600 text-white px-5 sm:px-6 py-3 rounded-lg">Buy Membership</button>
    </div>
  );
}
