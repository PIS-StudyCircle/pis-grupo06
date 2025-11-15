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

  it("muestra skeletons mientras loading es true", () => {
    useSessions.mockReturnValue({
      sessions: [],
      loading: true,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <SessionList userId="u1" />
      </MemoryRouter>
    );

    const skeletons = document.querySelectorAll(".animate-pulse .h-20");

    expect(skeletons.length).toBe(3);
  });



  it("muestra el mensaje vacío para upcoming", () => {
    useSessions.mockReturnValue({
      sessions: [],
      loading: false,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <SessionList userId="u1" type="upcoming" />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/No tienes sesiones programadas/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Agenda una tutoría para comenzar a aprender/i)
    ).toBeInTheDocument();
  });

  it("muestra el mensaje vacío para finalized", () => {
    useSessions.mockReturnValue({
      sessions: [],
      loading: false,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <SessionList userId="u1" type="finalized" />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/no tienes sesiones finalizadas/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Cuando finalices alguna tutoría, aparecerá aquí/i)
    ).toBeInTheDocument();
  });

  it("muestra mensaje vacío para my_pendings", () => {
    useSessions.mockReturnValue({
      sessions: [],
      loading: false,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <SessionList userId="u1" type="my_pendings" />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/no tienes sesiones pendientes de confirmación/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Cuando crees una nueva tutoría, aparecerá aquí/i)
    ).toBeInTheDocument();
  });

  it("renderiza SessionCard cuando hay sesiones", () => {
    useSessions.mockReturnValue({
      sessions: [
        { id: "s1", title: "Tutoría 1" },
        { id: "s2", title: "Tutoría 2" },
      ],
      loading: false,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <SessionList userId="u1" type="upcoming" />
      </MemoryRouter>
    );

    const cards = screen.getAllByTestId("session-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Tutoría 1")).toBeInTheDocument();
    expect(screen.getByText("Tutoría 2")).toBeInTheDocument();

    // No deben aparecer mensajes vacíos
    expect(
      screen.queryByText(/no tienes sesiones/i)
    ).not.toBeInTheDocument();
  });
});
