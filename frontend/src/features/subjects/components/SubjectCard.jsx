import { useParams, useNavigate } from "react-router-dom";

export default function SubjectCard({
  subject,
  selected = false,
  onSelect,
  type = "button",
  onButtonClick,
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const handleClick = () => {
    if (type === "button") {
      navigate(`/materias/${courseId}/temas/${subject.id}`);
    } else if (type === "selectable" && onSelect) {
      onSelect(subject.id);
    }
  };

  const isSelectable = type === "selectable";
  const isButton = type === "button";

  return (
    <button
      type="button"
      className={`flex items-center justify-between p-2 pl-4 border rounded-md text-sm h-15 w-full transition-colors
        ${isSelectable && selected ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-800 hover:bg-gray-100"}
        ${isButton || isSelectable ? "cursor-pointer" : "cursor-default opacity-70"}`}
      onClick={handleClick}
      style={{ cursor: isButton || isSelectable ? "pointer" : "default" }}
    >
      <div className="flex flex-col text-left w-full">
        <span className={`font-medium transition-colors ${isSelectable && selected ? "text-white" : "text-gray-800"}`}>
          {subject.name}
        </span>
      </div>
    </button>
  );
}
