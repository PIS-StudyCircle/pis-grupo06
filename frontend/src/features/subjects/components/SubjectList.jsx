import { useState } from "react";
import SubjectCard from "./SubjectCard";
import { createSubject } from "../services/subjectService";
import { useValidation } from "@hooks/useValidation";
import { validateRequired, validateDate } from "@utils/validation";
import { useUser } from "@context/UserContext"; //lo pongo para que funcione con la seed que estoy utilizando y no cambiar mucho, pero esto no iria

export default function SubjectList({
  subjects,
  loading,
  error,
  showButton = false,
  courseId,
  onCreated = () => {},
  selectedSubjects = [],
  onSelectionChange = () => {},
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { user } = useUser(); //lo pongo para que funcione con la seed que estoy utilizando y no cambiar mucho, pero esto no iria

  // --- Validaciones ---
  const validators = {
    subjectName: (value) => validateRequired(value, "Nombre"),
    dueDate: (value) => validateDate(value, "Fecha de vencimiento"),
  };
  const { errors, validate } = useValidation(validators);

  // --- Early returns ---
  if (loading) return <div>Cargando temas...</div>;
  if (error) return <div>Error al cargar los temas.</div>;
  if (!subjects || subjects.length === 0)
    return <div>No hay temas disponibles.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = { subjectName: newName, dueDate: newDate };
    if (!validate(form)) return;

    try {
      const created = await createSubject({
        name: newName,
        course_id: courseId,
        due_date: newDate || null,
        creator_id: user?.id, // lo pongo para que funcione con la seed que estoy utilizando y no cambiar mucho, pero esto no iria
      });

      onCreated?.();

      setShowNewForm(false);
      setNewName("");
      setNewDate("");

      // Agrega el nuevo tema a la selección global
      if (showButton) {
        onSelectionChange([...selectedSubjects, created.id]);
      }
    } catch (err) {
      const msg =
        err?.errors
          ? Object.entries(err.errors)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : err?.message || "No se pudo crear el tema.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (id) => {
    if (!onSelectionChange) return;
    if (selectedSubjects.includes(id)) {
      onSelectionChange(selectedSubjects.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedSubjects, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {showButton && !showNewForm && (
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

          <div className="flex flex-col text-left">
            <label
              htmlFor="dueDate"
              className="text-gray-600 text-xs font-medium mb-1"
            >
              Fecha de vencimiento
            </label>
            <input
              id="dueDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="p-1 border rounded-md text-sm"
            />
            {errors.dueDate && (
              <span className="text-red-500 text-xs mt-1">
                {errors.dueDate}
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
                setNewDate("");
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
          selectable={showButton}
          selected={selectedSubjects.includes(subject.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
