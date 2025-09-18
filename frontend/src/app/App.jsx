import { AppRoutes } from "./routes";
import Layout from "@components/layout/Layout";

import UserProvider from "../features/users/userProvider.";

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
