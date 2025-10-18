import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("../hooks/useSessions", () => ({
  useSessions: jest.fn(),
}));
jest.mock("../components/SessionCard", () => ({
  __esModule: true,
  default: ({ session }) => (
    <div data-testid="session-card">{session.title ?? session.id}</div>
  ),
}));

import { useSessions } from "../hooks/useSessions";
import SessionList from "../pages/SessionListPage";

describe("SessionList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Muestra la animación de carga", () => {
    useSessions.mockReturnValue({ sessions: [], loading: true, error: null });

    render(
      <MemoryRouter initialEntries={["/calendario"]}>
        <SessionList userId="u1" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /próximas sesiones/i })
    ).toBeInTheDocument();

    // En modo loading no aparecen los mensajes vacíos
    expect(
      screen.queryByText(/no tienes sesiones programadas/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/no tienes invitaciones/i)
    ).not.toBeInTheDocument();
  });

  it("muestra mensaje vacío por defecto", () => {
    useSessions.mockReturnValue({ sessions: [], loading: false, error: null });

    render(
      <MemoryRouter initialEntries={["/agenda"]}>
        <SessionList userId="u1" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /próximas sesiones/i })
    ).toBeInTheDocument();

    // Mensaje default
    expect(
      screen.getByText(/no tienes sesiones programadas/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/¡agenda una tutoría para comenzar a aprender!/i)
    ).toBeInTheDocument();
  });

  it("muestra mensaje vacío cuando ruta incluye /notificaciones", () => {
    useSessions.mockReturnValue({ sessions: [], loading: false, error: null });

    render(
      <MemoryRouter initialEntries={["/notificaciones"]}>
        <SessionList userId="u1" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /próximas sesiones/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no tienes invitaciones/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cuando te inviten a una tutoría, aparecerá aquí\./i)
    ).toBeInTheDocument();
  });

  it("renderiza sesiones cuando hay datos", () => {
    useSessions.mockReturnValue({
      sessions: [
        { id: "s1", title: "Tutoría 1" },
        { id: "s2", title: "Tutoría 2" },
      ],
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/agenda"]}>
        <SessionList userId="u1" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /próximas sesiones/i })
    ).toBeInTheDocument();

    // Nuestros SessionCard
    expect(screen.getAllByTestId("session-card")).toHaveLength(2);
    expect(screen.getByText("Tutoría 1")).toBeInTheDocument();
    expect(screen.getByText("Tutoría 2")).toBeInTheDocument();

    // No debería mostrar mensajes vacíos si hay sesiones
    expect(
      screen.queryByText(/no tienes sesiones programadas/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/no tienes invitaciones/i)
    ).not.toBeInTheDocument();
  });
});
