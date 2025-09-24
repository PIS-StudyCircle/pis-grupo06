import { useState, useEffect } from "react";
import SubjectList from "../components/SubjectList";

import { useSubjects } from "../hooks/useSubjects";
import SearchInput from "@components/SearchInput";
import Pagination from "@components/Pagination";


export default function SubjectPage({courseId, showCheckbox = false, showButton = false, onSelectionChange}) {

  const {
    subjects,
    loading,
    error,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    refetch
  } = useSubjects(courseId); 
  const totalPages = pagination.last || 1;

  const handleCreated = () => {
    if (page !== 1) setPage(1);
    else refetch();  
  }
  const [query, setQuery] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, setPage, setSearch]);

  return (
    <div className="flex flex-col ">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold p-2 mb-4 text-black">
            Temas
          </h1>

          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tema..."
          />

          {/*ESTE CID ESTA PARA PODER USAR subjects/:courseId. CUANDO YA NO SE VAYA A USAR SE CAMBIA A courseId*/}
          <SubjectList subjects={subjects} loading={loading} error={error} showCheckbox={showCheckbox} showButton={showButton} courseId={courseId} onCreated={handleCreated} onSelectionChange={onSelectionChange} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
