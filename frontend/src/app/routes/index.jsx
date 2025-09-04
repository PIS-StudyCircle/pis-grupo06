import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { FacultiesPage } from "@/features/faculties";
import { SignInPage, RegisterPage } from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";


export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<FacultiesPage />} />
      </Route>

      <Route element={<RequireGuestRoute />}>
        <Route path="/sign_in" element={<SignInPage />} />
        <Route path="/sign_up" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
