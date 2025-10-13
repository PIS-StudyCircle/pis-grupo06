import { AppRoutes } from "./routes";
import Layout from "@components/layout/Layout";

import UserProvider from "@/features/users/userProvider";
import { NotificationsProvider } from "@/features/notifications/notificationProvider";

import "../App.css";

export default function App() {
  return (
    <div className="app-container">
      <UserProvider>
        <NotificationsProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </NotificationsProvider>
      </UserProvider>
    </div>
  ); 
}
