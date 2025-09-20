// src/app/App.jsx
import { AppRoutes } from "./routes";
import Layout from "../shared/components/layout/Layout";

import UserProvider from "../features/users/user";

import "../App.css";

export default function App() {
  return (
    <div className="app-container">
      <UserProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </UserProvider>
    </div>
  ); 
}