import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatDateTime } from "@shared/utils/FormatDate";
import { useUser } from "@context/UserContext"; 

export default function ChooseScheduleByTutor() {
  const { tutoringId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser(); 
  const tutoring = location.state?.tutoring;

  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
    setLoading(true);
    try {
      let data;
      if (tutoring) {
        data = tutoring;
      } else {
        const res = await fetch(`/api/v1/tutorings/${tutoringId}`);
        if (!res.ok) throw new Error("Error al obtener tutoría");
        data = await res.json();
      }

      setAvailableSchedules(
        data.availabilities?.map(a => ({ id: a.id, time: a.start_time })) || []
      );
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la tutoría");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  }, [tutoringId, tutoring]);



  const handleConfirm = async () => {
  if (!selectedTime) return alert("Seleccioná un horario antes de continuar.");

  try {
    const res = await fetch(`/api/v1/tutorings/${tutoringId}/confirm_schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduled_at: selectedTime,
        role: "tutor",
      }),
    });

    if (res.ok) {
      alert("Tutoría asignada con éxito");
      navigate("/");
    } else {
      const data = await res.json();
      alert(data.error || "Error al asociarte como tutor");
    }
  } catch (error) {
    console.error(error);
    alert("Error en la conexión con el servidor");
  }
};


  if (loading) return <p>Cargando horarios...</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Seleccioná un horario para brindar la tutoría
      </h2>

      {availableSchedules.length === 0 ? (
        <p>No hay horarios disponibles para esta tutoría.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {availableSchedules.map((schedule) => (
            <li key={schedule.id} className="flex items-center">
              <input
                type="radio"
                id={`s-${schedule.id}`}
                name="schedule"
                value={schedule.time}
                className="mr-3"
                onChange={() => setSelectedTime(schedule.time)}
                />
                <label htmlFor={`s-${schedule.id}`}>
                {formatDateTime(schedule.time)}
                </label>
            </li>
          ))}
        </ul>
      )}

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        onClick={handleConfirm}
      >
        Confirmar
      </button>
    </div>
  );
}
