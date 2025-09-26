import { createClassEvent } from "./services/calendarApi";

export function CreateClassButton() {
  const handleClick = async () => {
    try {
      const event = await createClassEvent({
        title: "Clase de Matemática",
        description: "Tutoría de funciones trigonométricas",
        start: "2025-09-30T10:00:00-03:00",
        end: "2025-09-30T11:00:00-03:00",
        attendees: [{ email: "alumno@example.com" }],
      });
      console.log("Evento creado:", event);
    } catch (error) {
      console.error("Error creando evento:", error);
    }
  };

  return <button onClick={handleClick}>Crear Clase</button>;
}
