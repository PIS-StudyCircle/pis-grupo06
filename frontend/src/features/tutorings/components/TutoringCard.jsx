import { formatDateTime } from "@shared/utils/FormatDate";
//import { useNavigate } from "react-router-dom";

export default function TutoringCard({ tutoring, mode }) {
  //const navigate = useNavigate();
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-2">
      <div className="flex w-full gap-4">

        <div className="flex-none w-[80%] flex flex-col text-left">
          <p className="tutoring-card-title">
            <b>Materia: </b>
            {tutoring.course.name}
          </p>

          <p className="tutoring-card-title mt-1">
          <b>Fecha: </b> {formatDateTime(tutoring.scheduled_at)} 
        </p>
          <p className="tutoring-card-title mt-1"><b>Modalidad: </b> {tutoring.modality}</p>
          <p className="text-gray-600 text-sm mt-1">
            <b>Cupos disponibles: </b> {tutoring.capacity - tutoring.enrolled}
          </p>
          <p className="tutoring-card-titlemt-1"><b>Temas:</b></p>
          <div className="flex flex-wrap gap-2 mt-1">
            {tutoring.subjects.slice(0, 3).map((subject) => (
              <span
                key={subject.id}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {subject.name}
              </span>
            ))}
            {tutoring.subjects.length > 5 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                +{tutoring.subjects.length - 5}
              </span>
            )}
          </div>
        </div>

        <div className="flex-none w-[20%] flex flex-col justify-start items-end pr-3">
          {mode === "serTutor" && 
            <button
              className="btn btn-primary tutoring-card-button"
              //onClick={() => navigate(`/tutorias/brindar/${course.id}`)}
            >Ser tutor</button>
          }
          {mode === "unirme" && <button className="btn btn-primary tutoring-card-button">Unirme</button>}
          {mode === "misTutorias" && <button className="btn btn-primary tutoring-card-button">Desuscribirme</button>}
        </div>
      </div>

    </div>
  );
}
