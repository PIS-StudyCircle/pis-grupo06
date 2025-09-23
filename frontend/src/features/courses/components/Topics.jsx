// Componente para mostrar los temas de un curso
export default function CourseTopics({ subjects = [] }) {
  return (
    <div className="border-t border-gray-200 mt-6 pt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Temas</h2>

      {subjects.length > 0 ? (
        <ul className="space-y-2">
          {subjects.map((s) => (
            <li
              key={s.id}
              className="p-2 pl-4 border rounded-md bg-gray-50 text-gray-800 text-sm hover:bg-gray-100 text-left"
            >
              {s.name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 p-3 border rounded-md bg-gray-50 text-sm text-gray-500 text-center">
          Todavía no hay temas asociados
        </div>
      )}
    </div>
  );
}
