import { createContext, useContext, useState } from "react";

export const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(0);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Exportación con nombre diferente para evitar el error de Fast Refresh
export const useNotifications = () => useContext(NotificationsContext);