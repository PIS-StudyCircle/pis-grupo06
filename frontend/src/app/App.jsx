import { AppRoutes } from "./routes";
import NavBar from "@components/NavBar";
import Footer from "@components/Footer";
import UserProvider from "../features/users/user";
import "../App.css";

export default function App() {
  return (
    <div className="app-container">
      <div className="flex flex-col h-screen">
        <UserProvider>
          <NavBar />
          <main>
          <AppRoutes />
          </main>
          <Footer />
        </UserProvider>
      </div>
    </div>
  );
}
