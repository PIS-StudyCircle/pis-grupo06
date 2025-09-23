import { useState } from "react";
import SubjectCard from "./SubjectCard";
import { useValidation } from "@hooks/useValidation";
import {validateRequired, validateDate } from "@utils/validation";

export default function SubjectList({
  subjects,
  loading,
  error,
  showCheckbox = false,
  showButton = false,
  courseId
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); //Para crear tutorias

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = {
      subjectName: newName,
      dueDate: newDate,
    };

    if (!validate(form)) {
      return;
    }

    // Llamar API - POST de subjects

    var newId = 852; //Id declarado para probar, la idea es que sea el que devuelve el POST de subjects
    

    const newSubject = {
      id: newId,
      name: newName,
      due_date: newDate,
    };
    subjects.push(newSubject); //Sacar cuando se llame al backend
    
    setSelectedIds((prev) => [...prev, newId]);
    // limpiar
    setShowNewForm(false);
    setNewName("");
    setNewDate("");
  };

  const handleCheckboxChange = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          showCheckbox={showCheckbox}
          onCheckboxChange={handleCheckboxChange}
          checked={selectedIds.includes(subject.id)}
        />
      ))}

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
          {/* Nombre */}
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

      {/* DEBUG  */}
      <pre className="text-xs text-gray-500 mt-2">{JSON.stringify(selectedIds)}</pre>
    </div>
  );
}
