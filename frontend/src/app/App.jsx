import { AppRoutes } from "./routes";
import UserProvider from "../features/users/user";

export default function App() {
  return (
    <div className="app-container">
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </div>
  );
}
