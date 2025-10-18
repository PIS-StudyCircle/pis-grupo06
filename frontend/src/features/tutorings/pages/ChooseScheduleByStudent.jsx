import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatDateTime } from "@shared/utils/FormatDate";

import { useTutoring } from "../hooks/useTutorings";
import { confirmSchedule } from "../services/tutoringService";

export default function ChooseScheduleByStudent() {
  const { tutoringId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const tutoring = location.state?.tutoring;

  const { data, loading, error: loadError } = useTutoring(tutoring, tutoringId);

  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [capacity, setCapacity] = useState(1);
  const [customTimes, setCustomTimes] = useState({});
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  useEffect(() => {
    if (!data) return;
    setAvailableSchedules(
      (data.availabilities || []).map(a => ({
        id: a.id,
        start: a.start_time,
        end: a.end_time,
      }))
    );
    setCapacity(data.capacity || 1);
  }, [data]);

  useEffect(() => {
    if (loadError) setError(loadError);
  }, [loadError]);

  const handleConfirm = async () => {
    setMessage(null);
    setError(null);

    const custom = customTimes[selectedScheduleId];

    // Validaciones
    if (!selectedScheduleId || !custom?.start || !custom?.end) {
      setError("Debes especificar una hora de inicio y fin.");
      return;
    }

    const schedule = availableSchedules.find(s => s.id === selectedScheduleId);
    const localDate = new Date(schedule.start);
    const y = localDate.getFullYear();
    const m = String(localDate.getMonth() + 1).padStart(2, "0");
    const d = String(localDate.getDate()).padStart(2, "0");
    const localDateStr = `${y}-${m}-${d}`;

    const fullStart = `${localDateStr}T${custom.start}:00`;
    const fullEnd   = `${localDateStr}T${custom.end}:00`;

    const startTime = new Date(fullStart);
    const endTime   = new Date(fullEnd);
    const scheduleStart = new Date(schedule.start);
    const scheduleEnd   = new Date(schedule.end);

    if (endTime <= startTime) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
    if (startTime < scheduleStart || endTime > scheduleEnd) {
      setError("El horario elegido no está dentro de las disponibilidades ofrecidas.");
      return;
    }

    try {
      await confirmSchedule(tutoringId, {
        scheduled_at: fullStart,
        end_time: fullEnd,
        role: "student",
        capacity,
      });
      setMessage("Tutoría confirmada con éxito.");
      setTimeout(() => navigate("/"), 2000);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Error en la conexión con el servidor.");
    }
  };

  const toLocalTimeString = (dateString) => {
    const d = new Date(dateString);
    // Devuelve "HH:MM" en hora local del navegador
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  if (loading) return <p className="text-center text-gray-600 mt-6">Cargando horarios...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">
        Seleccioná un horario para tener la tutoría
      </h2>

      {/* Mensajes */}
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      {message && (
        <div className="text-green-600 text-center mb-4">
          {message}
          <div>Serás redirigido en unos segundos.</div>
        </div>
      )}

      {/* Horarios */}
      {availableSchedules.length === 0 ? (
        <div className="text-center text-gray-600 mb-8">
          No hay horarios disponibles para esta tutoría.
        </div>
      ) : (
        <ul className="space-y-4 mb-8">
          {availableSchedules.map((schedule) => {
            const customStart = customTimes[schedule.id]?.start || "";
            const customEnd = customTimes[schedule.id]?.end || "";
            const sameDay =
              new Date(schedule.start).toLocaleDateString() ===
              new Date(schedule.end).toLocaleDateString();

            return (
              <li
                key={schedule.id}
                className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <label className="font-medium text-gray-800 block mb-2">
                  {sameDay
                    ? `${formatDateTime(schedule.start)} – ${new Date(
                        schedule.end
                      ).toLocaleTimeString("es-UY", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}`
                    : `${formatDateTime(schedule.start)} – ${formatDateTime(
                        schedule.end
                      )}`}
                </label>

                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input
                    type="radio"
                    id={`s-${schedule.id}`}
                    name="schedule"
                    value={schedule.start}
                    onChange={() => {
                      setSelectedScheduleId(schedule.id);
                    }}
                  />

                  <div className="flex gap-2 items-center">
                    <input
                      type="time"
                      value={customStart}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomTimes((prev) => ({
                          ...prev,
                          [schedule.id]: { ...prev[schedule.id], start: value },
                        }));
                      }}
                      min={toLocalTimeString(schedule.start)}
                      max={toLocalTimeString(schedule.end)}
                      className="border rounded px-2 py-1 bg-white"
                    />

                    <span>–</span>

                    <input
                      type="time"
                      value={customEnd}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomTimes((prev) => ({
                          ...prev,
                          [schedule.id]: { ...prev[schedule.id], end: value },
                        }));
                      }}
                      min={toLocalTimeString(schedule.start)}
                      max={toLocalTimeString(schedule.end)}
                      className="border rounded px-2 py-1 bg-white"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        className={`w-full py-3 rounded-lg font-semibold shadow-md transition-transform ${
          availableSchedules.length === 0
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white"
        }`}
        onClick={handleConfirm}
        disabled={availableSchedules.length === 0}
      >
        Confirmar
      </button>
    </div>
  );
}
