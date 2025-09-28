import { AppRoutes } from "./routes";
import Layout from "@components/layout/Layout";
import { UserProvider } from "@/features/users";
import "../App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <div className="app-container">
      <UserProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </UserProvider>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
