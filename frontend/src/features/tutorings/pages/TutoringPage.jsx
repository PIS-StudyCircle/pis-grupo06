import { useState, useMemo } from 'react';
import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";    
import Pagination from "@components/Pagination";


export default function TutoringPage({filters = {}, mode = ""}) {
  const [showWithoutTutor, setShowWithoutTutor] = useState(false);
  const activeFilters = useMemo(() => {
    const filtros = { ...filters };
    if (showWithoutTutor) {
      filtros.no_tutor = true;
    }
    return filtros;
  }, [filters, showWithoutTutor]);

  const { tutorings, loading, error, pagination, page, setPage } = useTutorings(1, 20, activeFilters);
  const totalPages = pagination.last || 1;


  return (
    <div className="flex flex-col ">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4 p-2">
          <h1 className="text-2xl font-bold p-2 mb-4 text-black">
            Tutorías Disponibles
          </h1>
          <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWithoutTutor}
                onChange={(e) => setShowWithoutTutor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Mostrar solo sin tutor</span>
            </label>
          </div>
          <TutoringList tutorings={tutorings} mode = {mode} loading={loading} error={error} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
