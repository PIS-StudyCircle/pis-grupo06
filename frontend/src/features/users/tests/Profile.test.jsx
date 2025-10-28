import { render, screen } from "@testing-library/react";
import Profile from "../pages/ProfilePage";
import React from "react";
import { MemoryRouter } from "react-router-dom";

jest.mock("@context/UserContext", () => ({
  useUser: jest.fn(),
}));

// Mockear getMyFavoriteCourses para evitar fetch en node/jsdom
jest.mock("../../courses/services/courseService", () => ({
  getMyFavoriteCourses: jest.fn().mockResolvedValue([]),
}));

function renderProfilePage() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}

import { useUser } from "@context/UserContext";

describe("<Profile />", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("muestra el estado de carga", () => {
    useUser.mockReturnValue({ user: null, loading: true, error: null });

    renderProfilePage();

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  test("muestra el estado de error", () => {
    useUser.mockReturnValue({ user: null, loading: false, error: "boom" });

    renderProfilePage();

    expect(screen.getByText("Error al cargar perfil.")).toBeInTheDocument();
  });

  test("muestra el mensaje cuando no hay usuario", () => {
    useUser.mockReturnValue({ user: null, loading: false, error: null });

    renderProfilePage();

    expect(screen.getByText("No hay usuario cargado.")).toBeInTheDocument();
  });

  test("renderiza datos del usuario con descripción", async () => {
    const fakeUser = {
      name: "Juan",
      last_name: "Pérez",
      email: "juan@ejemplo.com",
      description: "Desarrollador front.",
    };
    useUser.mockReturnValue({ user: fakeUser, loading: false, error: null });

    renderProfilePage();

    // Nombre y apellido
    expect(
      screen.getByText(`${fakeUser.name} ${fakeUser.last_name}`)
    ).toBeInTheDocument();

    // Email en input readOnly con su valor
    expect(screen.getByText(fakeUser.email)).toBeInTheDocument();

    // Descripción en textarea
    expect(screen.getByText(fakeUser.description)).toBeInTheDocument();

    // Avatar
    const avatar = screen.getByAltText("avatar");
    expect(avatar).toBeInTheDocument();
  });

  test("renderiza datos del usuario sin descripción (no muestra textarea)", () => {
    const fakeUser = {
      name: "Ana",
      last_name: "García",
      email: "ana@ejemplo.com",
      description: "",
    };
    useUser.mockReturnValue({ user: fakeUser, loading: false, error: null });

    renderProfilePage();

    // Nombre y apellido
    expect(
      screen.getByText(`${fakeUser.name} ${fakeUser.last_name}`)
    ).toBeInTheDocument();

    // Email presente
    expect(screen.getByText(fakeUser.email)).toBeInTheDocument();

    // No hay textarea de descripción cuando description es vacía
    expect(screen.queryByLabelText("Descripción")).not.toBeInTheDocument();
  });
});
