export default function SubjectCard({ subject, showCheckbox = false, onCheckboxChange, checked = false }) {
  return (
    <div className="flex items-center justify-between p-2 pl-4 border rounded-md bg-gray-50 text-gray-800 text-sm hover:bg-gray-100 h-15">
      <div className="flex flex-col text-left">
        <span className="font-medium">{subject.name}</span>
      </div>
      {showCheckbox && (
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={checked}
          onChange={(e) => onCheckboxChange?.(subject.id, e.target.checked)}
        />
      )}
    </div>
  );
}
