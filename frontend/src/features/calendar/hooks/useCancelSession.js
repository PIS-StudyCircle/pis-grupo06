import { deleteClassEvent } from "../services/calendarApi";
import { showSuccess, showError, showConfirm } from "@utils/toastService";

export const handleCancel = (sessionId, refresh) => {
  showConfirm(
    "¿Seguro que deseas cancelar esta tutoría?",
    async () => {
      try {
        await deleteClassEvent(sessionId);
        showSuccess("Evento cancelado correctamente");
        if (refresh) refresh();
      } catch (err) {
        showError("Error al cancelar: " + err.message);
      }
    },
    () => {
      console.log("Cancelado por el usuario");
    }
  );
};
