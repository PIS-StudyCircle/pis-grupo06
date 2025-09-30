import { useState, useEffect } from "react";
import SubjectCard from "./SubjectCard";
import { createSubject } from "../services/subjectService";
import { useValidation } from "@hooks/useValidation";
import { validateRequired } from "@utils/validation";

export default function SubjectList({
  subjects,
  loading,
  error,
  showCreate = false,
  type = "button",
  courseId,
  onCreated = () => {},
  onSelectionChange = () => {},
  onButtonClick,
  selectedSubjects = [],
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedIds, setSelectedIds] = useState(selectedSubjects);

  const validators = {
    subjectName: (value) => validateRequired(value, "Nombre"),
  };
  const { errors, validate } = useValidation(validators);

  useEffect(() => {
    if (type === "selectable") {
      onSelectionChange(selectedIds);
    }
  }, [selectedIds, onSelectionChange, type]);

  useEffect(() => {
    if (type === "selectable") {
      setSelectedIds(selectedSubjects);
    }
  }, [selectedSubjects, type]);

  if (loading) return <div>Cargando temas...</div>;
  if (error) return <div>Error al cargar los temas.</div>;
  if (!subjects || subjects.length === 0)
    return <div>No hay temas disponibles.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = { subjectName: newName };
    if (!validate(form)) return;

    try {
      const created = await createSubject({
        name: newName,
        course_id: courseId,
      });

      onCreated?.();
      setShowNewForm(false);
      setNewName("");
      if (type === "selectable") {
        setSelectedIds((prev) => [...prev, created.id]);
      }
    } catch (err) {
      const msg =
        err?.errors
          ? Object.entries(err.errors)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : err?.message || "No se pudo crear el tema.";
      setFormError(msg);
    }
  };

  const handleSelect = (id) => {
    if (type === "selectable") {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {showCreate && !showNewForm && (
        <button
          onClick={() => setShowNewForm(true)}
          className="p-2 border rounded-md bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 text-left"
        >
          + Crear Nuevo Tema
        </button>
      )}

      {showNewForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 p-2 border rounded-md bg-gray-50 text-sm"
        >
          <div className="flex flex-col text-left">
            <label
              htmlFor="subjectName"
              className="text-gray-600 text-xs font-medium mb-1"
            >
              Nombre del tema
            </label>
            <input
              id="subjectName"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-1 border rounded-md text-sm"
            />
            {errors.subjectName && (
              <span className="text-red-500 text-xs mt-1">
                {errors.subjectName}
              </span>
            )}
          </div>

          {formError && <p className="text-red-600 text-xs">{formError}</p>}
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
            >
              Guardar
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400"
              onClick={() => {
                setShowNewForm(false);
                setNewName("");
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          selected={type === "selectable" ? selectedIds.includes(subject.id) : false}
          onSelect={handleSelect}
          type={type}
          onButtonClick={onButtonClick}
        />
      ))}
    </div>
  );
}
