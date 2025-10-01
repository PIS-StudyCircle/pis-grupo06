import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";    
import Pagination from "@components/Pagination";
import { useUser } from "@context/UserContext";

export default function TutoringPage({filters = {}}) {
  const hookResult = useTutorings(1, 20, filters);
  
    
  const { tutorings, loading, error, pagination = {}, page, setPage } = hookResult;
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


  return (
    <div className="flex flex-col ">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold p-2 mb-4 text-black">
            Tutorías Disponibles
          </h1>

          <TutoringList tutorings={tutorings} mode = {getModeForTutoring} loading={loading} error={error} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
