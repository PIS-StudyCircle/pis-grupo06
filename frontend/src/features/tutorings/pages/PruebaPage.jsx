//ESTA PAGINA ES PARA PROBAR LOS FILTROS DE TUTORIAS, SE PUEDE BORRAR DESPUES
//O REUTILIZAR LA LOGICA PARA LAS PANTALLAS CORRESPONDIENTES

//DESDE 'MI PERFIL' SE ACCEDERÁ A DOS PAGINAS SIMILARES, MOSTRANDO EN UNA LAS TUTORIAS CREADAS POR EL USUARIO LOGUEADO Y EN 
//OTRA LAS TUTORIAS EN LAS QUE ESTA INSCRIPTO, EN CADA CASO CON UN MODE DIFERENTE ('misTutorias' Y 'desuscribirme' RESPECTIVAMENTE)

//DESDE EL SHOW DE UNA MATERIA, SI SE SELECCIONA 'Ver Tutorias' SE ACCEDERÁ A UNA PAGINA SIMILAR, 
//MOSTRANDO LAS TUTORIAS DE ESA MATERIA, CON EL MODE 'unirme'

//DESDE EL SHOW DE UNA MATERIA, SI SE SELECCIONA 'Ser Tutor' SE ACCEDERÁ A UNA PAGINA SIMILAR, 
//MOSTRANDO LAS TUTORIAS DE ESA MATERIA QUE NO TIENEN TUTOR ASIGNADO, CON EL MODE 'serTutor'



import { useState } from "react";
import TutoringPage from "./TutoringPage";

export default function TutoringFiltersPage() {
  const [filters, setFilters] = useState({
    enrolled: false,
    course_id: "",
    created_by_user: "",
    no_tutor: false,
    past: false,
  });

  const [mode, setMode] = useState("serTutor"); // Estado para el select de modo

  const users = [
    { id: 1, name: "Ana Pérez" },
    { id: 2, name: "Luis Gómez" },
    { id: 3, name: "María Rodríguez" },
    { id: 4, name: "Juan Pérez" },
    { id: 5, name: "Marta Da Luz" },
    { id: 6, name: "Carlos López" },
    { id: 7, name: "Lucía Fernández" },
    { id: 8, name: "Diego Martínez" },
    { id: 9, name: "Sofía García" },
    { id: 10, name: "Martín Ramírez" },
    { id: 11, name: "Camila Ayuto" },
  ];

  const handleChangeCheckbox = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeUser = (e) => {
    setFilters((prev) => ({ ...prev, created_by_user: e.target.value }));
  };

  return (
    <div className="flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-4">Filtrar Tutorías</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Checkboxes */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enrolled"
            checked={filters.enrolled}
            onChange={handleChangeCheckbox}
          />
          Solo en las que estoy inscripto
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="no_tutor"
            checked={filters.no_tutor}
            onChange={handleChangeCheckbox}
          />
          Sin tutor asignado
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="past"
            checked={filters.past}
            onChange={handleChangeCheckbox}
          />
          Mostrar las que ya pasaron
        </label>

        {/* Input para código de curso */}
        <input
          type="text"
          name="course_id"
          value={filters.course_id}
          onChange={handleChangeInput}
          placeholder="Código de materia..."
          className="border rounded p-1 w-64"
        />

        {/* Select usuarios */}
        <select
          name="created_by_user"
          value={filters.created_by_user}
          onChange={handleChangeUser}
          className="border rounded p-1 w-64"
        >
          <option value="">Creadas por cualquier usuario</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Select para modos */}
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border rounded p-1 w-48"
        >
          <option value="serTutor">Ser tutor</option>
          <option value="unirme">Unirme</option>
          <option value="misTutorias">Mis tutorías</option>
        </select>
      </div>

      {/* Página principal de tutorías */}
      <TutoringPage filters={filters} mode={mode} />
    </div>
  );
}
