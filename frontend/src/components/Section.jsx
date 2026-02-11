function Section({ title, action, children }) {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {action && <button
          style={{ backgroundColor: "#00B562", color: "white" }}
          className="px-6 py-3 rounded-xl font-semibold shadow"
        >{action}</button>}
      </div>
      {children}
    </div>
  );
}

export default Section;
