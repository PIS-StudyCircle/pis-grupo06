import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ChooseScheduleByStudent from "../pages/ChooseScheduleByStudent";
import * as tutoringHooks from "../hooks/useTutorings";
import * as tutoringService from "../services/tutoringService";
import { showSuccess, showError } from "@shared/utils/toastService";

// Mocks
jest.mock("../hooks/useTutorings");
jest.mock("../services/tutoringService");
jest.mock("@shared/utils/toastService", () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ tutoringId: "123" }),
  useNavigate: () => jest.fn(),
  useLocation: jest.fn(),
}));

const renderChooseScheduleByStudent = async () => {
  return render(
    <MemoryRouter>
      <ChooseScheduleByStudent />
    </MemoryRouter>
  );
};

describe("ChooseScheduleByStudent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra mensaje de carga cuando loading = true", async () => {
    tutoringHooks.useTutoring.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    useLocation.mockReturnValue({ state: { tutoring: null } });

    await renderChooseScheduleByStudent();

    expect(screen.getByText(/Cargando horarios/i)).toBeInTheDocument();
  });

  it("muestra mensaje cuando no hay horarios disponibles", async () => {
    tutoringHooks.useTutoring.mockReturnValue({
      data: { availabilities: [], capacity: 1 },
      loading: false,
      error: null,
    });

    useLocation.mockReturnValue({ state: { tutoring: null } });

    await renderChooseScheduleByStudent();

    expect(
      screen.getByText(/No hay horarios disponibles/i)
    ).toBeInTheDocument();
  });

  it("muestra error si se intenta confirmar sin seleccionar horario", async () => {
    tutoringHooks.useTutoring.mockReturnValue({
      data: {
        availabilities: [
          {
            id: 1,
            start_time: "2025-11-01T10:00:00",
            end_time: "2025-11-01T12:00:00",
          },
        ],
        capacity: 1,
      },
      loading: false,
      error: null,
    });

    useLocation.mockReturnValue({ state: { tutoring: null } });

    await renderChooseScheduleByStudent();

    fireEvent.click(screen.getByText(/Confirmar/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Debes especificar una hora/i)
      ).toBeInTheDocument();
    });
  });

  it("muestra error si hora fin < hora inicio", async () => {
    tutoringHooks.useTutoring.mockReturnValue({
      data: {
        availabilities: [
          {
            id: 1,
            start_time: "2025-11-01T10:00:00",
            end_time: "2025-11-01T12:00:00",
          },
        ],
        capacity: 1,
      },
      loading: false,
      error: null,
    });

    useLocation.mockReturnValue({ state: { tutoring: null } });

    await renderChooseScheduleByStudent();

    // seleccionar horario
    fireEvent.click(screen.getByLabelText(/10:00/i));

    const [start, end] = screen.getAllByTestId("time-input");
    fireEvent.change(start, { target: { value: "11:30" } });
    fireEvent.change(end, { target: { value: "10:30" } });

    fireEvent.click(screen.getByText(/Confirmar/i));

    await waitFor(() => {
      expect(
        screen.getByText(/La hora de fin debe ser posterior/i)
      ).toBeInTheDocument();
    });
  });

  it("confirma tutoría correctamente y muestra toast", async () => {
    tutoringHooks.useTutoring.mockReturnValue({
      data: {
        availabilities: [
          {
            id: 1,
            start_time: "2025-11-01T10:00:00",
            end_time: "2025-11-01T12:00:00",
          },
        ],
        capacity: 2,
      },
      loading: false,
      error: null,
    });

    useLocation.mockReturnValue({ state: { tutoring: null } });

    tutoringService.confirmSchedule.mockResolvedValueOnce({});

    await renderChooseScheduleByStudent();

    fireEvent.click(screen.getByLabelText(/10:00/i));

    const [start, end] = screen.getAllByTestId("time-input");
    fireEvent.change(start, { target: { value: "10:15" } });
    fireEvent.change(end, { target: { value: "11:00" } });

    fireEvent.click(screen.getByText(/Confirmar/i));

    await waitFor(() => {
      expect(tutoringService.confirmSchedule).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalledWith(
        "Tutoría confirmada con éxito."
      );
    });
  });

  it("muestra toast de error si confirmSchedule lanza excepción", async () => {
    tutoringHooks.useTutoring.mockReturnValue({
      data: {
        availabilities: [
          {
            id: 1,
            start_time: "2025-11-01T10:00:00",
            end_time: "2025-11-01T12:00:00",
          },
        ],
        capacity: 1,
      },
      loading: false,
      error: null,
    });

    useLocation.mockReturnValue({ state: { tutoring: null } });

    tutoringService.confirmSchedule.mockRejectedValueOnce(
      new Error("Falla en servidor")
    );

    await renderChooseScheduleByStudent();

    fireEvent.click(screen.getByLabelText(/10:00/i));

    const [start, end] = screen.getAllByTestId("time-input");
    fireEvent.change(start, { target: { value: "10:15" } });
    fireEvent.change(end, { target: { value: "11:00" } });

    fireEvent.click(screen.getByText(/Confirmar/i));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith("Falla en servidor");
    });
  });
});
