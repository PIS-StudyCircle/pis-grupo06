import { unsubscribeFromClassEvent } from "../services/calendarApi";
import { showSuccess, showError, showConfirm } from "@utils/toastService";

export const handleCancel = (sessionId, refresh) => {
  showConfirm(
    "¿Seguro que deseas desuscribirte de esta tutoría?",
    async () => {
      try {
        await unsubscribeFromClassEvent(sessionId);
        showSuccess("Te desuscribiste correctamente");
        if (refresh) refresh();
      } catch (err) {
        showError("Error al desuscribirse: " + err.message);
      }
    },
    () => {
      console.log("Cancelado por el usuario");
    }
  );
};
