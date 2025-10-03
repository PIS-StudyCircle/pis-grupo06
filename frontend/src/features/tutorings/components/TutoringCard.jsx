import {formatDateTime} from "@shared/utils/FormatDate";

export default function TutoringCard({ tutoring, mode }) {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Información de la tutoría - sin cambios */}
        <div className="flex-1 flex flex-col text-left">
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
          <p className="tutoring-card-title mt-1"><b>Temas:</b></p>
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

        {/* Botones */}
        <div className="flex flex-col gap-3 md:pr-3">
          {mode === "serTutor" && (
            <button
              type="button"
              className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {}}
            >
              Ser tutor
            </button>
          )}

          {mode === "unirme" && (
            <button
              type="button"
              className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {}}
            >
              Unirme
            </button>
          )}

          {mode === "ambos" && (
            <>
              <button
                type="button"
                className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {}}
              >
                Ser tutor
              </button>
              <button
                type="button"
                className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {}}
              >
                Unirme
              </button>
            </>
          )}

          {mode === "misTutorias" && (
            <button
              type="button"
              className="btn w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {}}
            >
              Desuscribirme
            </button>
          )}

          {mode === "completo" && (
            <button
              type="button"
              className="btn w-full bg-gray-400 text-gray-700 cursor-not-allowed"
              disabled={true}
            >
              Completo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}