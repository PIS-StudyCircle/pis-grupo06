import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SessionCard from "../components/SessionCard";

jest.mock("lucide-react", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_, name) =>
        (props) => <svg data-icon={name} aria-hidden="true" {...props} />,
    }
  );
});

const mockHasFeedback = jest.fn();
const mockCreateFeedback = jest.fn();

jest.mock("../hooks/useFeedback", () => ({
  hasFeedback: (...args) => mockHasFeedback(...args),
  createFeedback: (...args) => mockCreateFeedback(...args),
}));

jest.mock("@context/UserContext", () => ({
  useUser: () => ({ user: { id: 42, name: "Tester" } }),
}));

jest.mock("@/shared/utils/toastService", () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

jest.mock("@/features/calendar/hooks/useCancelSession", () => ({
  handleCancel: jest.fn(),
}));

const baseSession = {
  id: 999,
  tutor_id: 777,
  tutor: "Ana perez",
  subject: "Estructuras de Datos",
  url: "https://example.com",
  role: "student",
  status: "confirmada",
  date: new Date("2025-05-10T14:30:00Z"),
  duration: 60,
  location: "Meet",
  attendees: [],
};

describe("SessionCard - puntuar_tutor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("flujo completo: sin feedback previo, despues abrir modal, puntuar y ver estrellas ", async () => {
    // No hay feedback previo
    mockHasFeedback.mockResolvedValueOnce({ has_feedback: false });

    // createFeedback devuelve un feedback con rating 5
    mockCreateFeedback.mockResolvedValueOnce({ feedback: { rating: 5 } });

    render(
      <SessionCard
        session={{ ...baseSession, status: "confirmada" }}
        type="finalized"
        refresh={jest.fn()}
      />
    );

    // Espera a que termine la verificación de feedback y aparezca el botón
    await waitFor(() => {
      expect(mockHasFeedback).toHaveBeenCalledWith(42, 999);
    });

    const leaveBtn = await screen.findByRole("button", { name: /Dejar feedback/i });
    expect(leaveBtn).toBeInTheDocument();

    // Abrir modal
    await userEvent.click(leaveBtn);

    // Título del modal
    expect(
      await screen.findByText(/Calificar a/i)
    ).toBeInTheDocument();
    expect(
        screen.getByRole("heading", { name: /Calificar a.*Ana perez/i })
    ).toBeInTheDocument();

    const starButtons = screen.getAllByRole("radio");
    expect(starButtons).toHaveLength(5);

    starButtons[0].focus();
    fireEvent.keyDown(starButtons[0], { key: "End" });

    const sendBtn = screen.getByRole("button", { name: /Enviar/i });
    expect(sendBtn).toBeEnabled();
    await userEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockCreateFeedback).toHaveBeenCalledWith(999, 5);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Calificar a/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/\(5\.0\/5\)/)).toBeInTheDocument();

    // El botón "Dejar feedback" ya no debería estar
    expect(screen.queryByRole("button", { name: /Dejar feedback/i })).not.toBeInTheDocument();
  });

  test("con feedback previo: muestra directamente estrellas y no el botón", async () => {
    mockHasFeedback.mockResolvedValueOnce({ has_feedback: true, rating: 4.5 });

    render(
      <SessionCard
        session={{ ...baseSession, status: "confirmada" }}
        type="finalized"
        refresh={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockHasFeedback).toHaveBeenCalledWith(42, 999);
    });

    expect(await screen.findByText(/\(4\.5\/5\)/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Dejar feedback/i })).not.toBeInTheDocument();
  });
});
