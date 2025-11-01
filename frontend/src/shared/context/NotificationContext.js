import { createContext, useContext } from "react";

export const NotificationsCtx = createContext(null);
export const useNotifications = () => useContext(NotificationsCtx);
