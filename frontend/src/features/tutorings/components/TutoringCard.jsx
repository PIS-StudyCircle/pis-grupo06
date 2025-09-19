import {formatDateTime} from "../../../shared/utils/FormatDate";

export default function TutoringCard({ tutoring, mode }) {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-2">
      <div className="flex w-full gap-4">

        <div className="flex-none w-[80%] flex flex-col text-left">
          <p className="text-gray-700 text-sm font-semibold">
            <b>Materia: </b>
            {tutoring.course.name}
          </p>

          <p className="text-gray-600 text-sm mt-1 font-semibold">
          <b>Fecha: </b> {formatDateTime(tutoring.scheduled_at)} 
        </p>
          <p className="text-gray-600 text-sm mt-1 font-semibold"><b>Modalidad: </b> {tutoring.modality}</p>
          <p className="text-gray-600 text-sm mt-1">
            <b>Cupos disponibles: </b> {tutoring.capacity - tutoring.enrolled}
          </p>
          <p className="text-gray-600 text-sm mt-1 font-semibold"><b>Temas:</b></p>
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
          {mode === "serTutor" && <button className="btn btn-primary cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-1 px-3 rounded-full">Ser tutor</button>}
          {mode === "unirme" && <button className="btn btn-primary cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-1 px-3 rounded-full">Unirme</button>}
          {mode === "misTutorias" && <button className="btn btn-primary cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-1 px-3 rounded-full">Desuscribirme</button>}
        </div>
      </div>

    </div>
  );
}
