export default function SubjectCard({
  subject,
  selectable = false,
  selected = false,
  onSelect,
}) {
  return (
    <button
      type={selectable ? "button" : undefined}
      onClick={selectable ? () => onSelect?.(subject.id) : undefined}
      className={`flex items-center justify-between p-2 pl-4 border rounded-md text-sm h-15 transition-colors
        ${selected
          ? "bg-blue-500 text-white border-blue-700"
          : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400"}
      `}
      style={{ width: "100%" }}
    >
      <div className="flex flex-col text-left">
        <span className={`font-medium transition-colors ${selected ? "text-white" : "text-gray-800"}`}>
          {subject.name}
        </span>
        {subject.due_date && (
          <span className={`text-xs transition-colors ${selected ? "text-white" : "text-gray-800"}`}>
            Vencimiento: {new Date(subject.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </button>
  );
}
