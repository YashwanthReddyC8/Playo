export default function Tabs({ activeTab, setActiveTab, counts }) {
  const tabs = [
    { key: "venues", label: "Venues" },
    { key: "coaching", label: "Coaching" },
    { key: "events", label: "Events" },
    { key: "memberships", label: "Memberships" },
  ];

  return (
    <div className="flex flex-wrap gap-3 sm:gap-6 border-b mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap shrink-0">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setActiveTab(t.key)}
          className={
            "pb-2 sm:pb-3 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap " +
            (activeTab === t.key
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-black")
          }
        >
          <span>{t.label}</span>
          <span
            className={
              "text-[10px] sm:text-xs px-2 py-0.5 rounded-full " +
              (activeTab === t.key
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600")
            }
          >
            {counts?.[t.key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
