export default function SubjectCard({ subject, checked, onToggle }) {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-2 flex items-center justify-between gap-2">
      <span className="text-black font-semibold text-lg">{subject.name}</span>
      <button
        type="button"
        onClick={() => onToggle(subject.id)}
        className={`px-4 py-2 rounded font-medium transition-colors ${
          checked
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
      >
        {checked ? "Quitar" : "Agregar"}
      </button>
    </div>
  );
}
