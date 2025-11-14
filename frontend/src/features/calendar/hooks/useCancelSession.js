import { unsubscribeFromClassEvent } from "../services/calendarApi";

export const handleCancel = async (sessionId) => {
  return await unsubscribeFromClassEvent(sessionId);
};
