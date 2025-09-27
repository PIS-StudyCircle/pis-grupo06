import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UserProfilePage from "../pages/UserProfilePage";
import * as userService from "../services/usersServices";
import { DEFAULT_PHOTO } from "@/shared/config";

jest.mock("../services/usersServices");

jest.mock('@/shared/config', () => ({
  API_BASE: '/api/v1',
  DEFAULT_PHOTO: 'http://example.com/default-avatar.png'
}));

describe("UserProfile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (id) => {
    return render(
      <MemoryRouter initialEntries={[`/usuarios/${id}`]}>
        <Routes>
          <Route path="/usuarios/:id" element={<UserProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("muestra loading al inicio", () => {
    userService.getUserById.mockReturnValue(new Promise(() => {}));

    renderWithRouter(1);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("muestra el usuario cuando se carga correctamente", async () => {
    userService.getUserById.mockResolvedValue({
      id: 1,
      name: "Ana",
      last_name: "Gómez",
      email: "ana@example.com",
      photo: null,
    });

    renderWithRouter(1);

    expect(await screen.findByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByAltText("avatar")).toHaveAttribute("src", DEFAULT_PHOTO);
  });

  it("muestra mensaje de error si la API falla", async () => {
    userService.getUserById.mockRejectedValue(new Error("Error de servidor"));

    renderWithRouter(1);

    expect(await screen.findByText(/error/i)).toHaveTextContent("Error: Error de servidor");
  });

  it("muestra mensaje si no hay usuario", async () => {
    userService.getUserById.mockResolvedValue(null);

    renderWithRouter(999);

    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument();
  });
});