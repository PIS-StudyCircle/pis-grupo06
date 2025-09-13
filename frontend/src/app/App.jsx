// src/app/App.jsx
import { AppRoutes } from "./routes";
import Layout from "../shared/components/layout/Layout";
import "../App.css";

export default function App() {
  return (
    <div className="app-container">
      <Layout>
        <AppRoutes />
      </Layout>
    </div>
  );
}
