import { useState, useEffect, useMemo } from "react";
import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";    
import TutoringSearchBar from "../components/TutoringSearchBar";
import Pagination from "@components/Pagination";
import { useUser } from "@context/UserContext";


export default function TutoringPage({filters, mode = ""}) {

  const [searchBy, setSearchBy] = useState("course");

  const mergedFilters = useMemo(() => {
    const baseFilters = filters ?? {};
    return { ...baseFilters, search_by: searchBy };
  }, [filters, searchBy]);

  const {
    tutorings, 
    loading, 
    error, 
    pagination, 
    page, 
    setPage,
    search,
    setSearch,
  } = useTutorings(1, 20, mergedFilters);

  const totalPages = pagination.last || 1;
  const { user } = useUser();
  
  const getModeForTutoring = (tutoring) => {

    if (!user) return "ambos";
    if (tutoring.tutor_id === user.id) {
      return "misTutorias";
    }
    
    if (tutoring.enrolled_students.some(student => student.id === user.id)) {
      return "misTutorias";
    }
    
    if (tutoring.capacity > tutoring.enrolled && tutoring.tutor_id) {
      return "unirme";
    }
  
    if(tutoring.capacity > tutoring.enrolled){
      return "ambos";
    }
    if(!tutoring.tutor_id){
      return "serTutor"
    }
    return "completo"
  };

  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      if (page !== 1) setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query, page, setSearch, setPage]);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [searchBy, page, setPage]);

  return (
    <div className="flex flex-col ">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold p-2 mb-4 text-black">
            Tutorías Disponibles
          </h1>

          <TutoringSearchBar
            query={query}
            onQueryChange={(e) => setQuery(e.target.value)}
            searchBy={searchBy}
            onSearchByChange={setSearchBy}
            placeholder={
              searchBy === "course"
                ? "Buscar por materia..."
                : "Buscar por tema..."
            }
          />

          <TutoringList tutorings={tutorings} mode = {mode} loading={loading} error={error} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
