import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import ChooseScheduleByTutor from "../pages/ChooseScheduleByTutor";
import { useTutoring } from "../hooks/useTutorings";
import { confirmSchedule } from "../services/tutoringService";
import { showSuccess } from "@shared/utils/toastService";

jest.mock("../hooks/useTutorings");
jest.mock("../services/tutoringService");
jest.mock("@shared/utils/toastService", () => ({
  showSuccess: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ tutoringId: "123" }),
  useNavigate: () => jest.fn(),
  useLocation: jest.fn(),
}));

async function renderChooseScheduleByTutor() {
  render(
    <MemoryRouter>
      <ChooseScheduleByTutor />
    </MemoryRouter>
  );
}

it("muestra mensaje de carga cuando loading = true", async () => {
  useTutoring.mockReturnValue({ data: null, loading: true, error: null });
  useLocation.mockReturnValue({ state: { tutoring: null } });

  await renderChooseScheduleByTutor();

  expect(screen.getByText(/Cargando horarios/i)).toBeInTheDocument();
});

it("muestra mensaje cuando no hay horarios disponibles", async () => {
  useTutoring.mockReturnValue({
    data: { availabilities: [], capacity: 1 },
    loading: false,
    error: null,
  });
  useLocation.mockReturnValue({ state: { tutoring: null } });

  await renderChooseScheduleByTutor();

  expect(screen.getByText(/No hay horarios disponibles/i)).toBeInTheDocument();
});

it("muestra error si se intenta confirmar sin seleccionar horario", async () => {
  useTutoring.mockReturnValue({
    data: {
      availabilities: [
        { id: 1, start_time: "2025-11-01T10:00:00", end_time: "2025-11-01T12:00:00" },
      ],
      capacity: 2,
    },
    loading: false,
    error: null,
  });
  useLocation.mockReturnValue({ state: { tutoring: null } });

  await renderChooseScheduleByTutor();

  fireEvent.click(screen.getByText(/Confirmar/i));

  await waitFor(() => {
    expect(
      screen.getByText(/Debes especificar una hora de inicio y fin/i)
    ).toBeInTheDocument();
  });
});

it("muestra error si la hora de fin es anterior a la de inicio", async () => {
  useTutoring.mockReturnValue({
    data: {
      availabilities: [
        { id: 1, start_time: "2025-11-01T10:00:00", end_time: "2025-11-01T12:00:00" },
      ],
      capacity: 2,
    },
    loading: false,
    error: null,
  });
  useLocation.mockReturnValue({ state: { tutoring: null } });

  await renderChooseScheduleByTutor();

  fireEvent.click(screen.getByLabelText(/10:00/i));

  const [horaInicio, horaFin] = screen.getAllByTestId("time-input");
  fireEvent.change(horaInicio, { target: { value: "11:30" } });
  fireEvent.change(horaFin, { target: { value: "10:30" } });

  fireEvent.click(screen.getByText(/Confirmar/i));

  await waitFor(() => {
    expect(
      screen.getByText(/La hora de fin debe ser posterior/i)
    ).toBeInTheDocument();
  });
});

it("confirma tutoría correctamente y muestra toast de éxito", async () => {
  useTutoring.mockReturnValue({
    data: {
      availabilities: [
        { id: 1, start_time: "2025-11-01T10:00:00", end_time: "2025-11-01T12:00:00" },
      ],
      capacity: 2,
    },
    loading: false,
    error: null,
  });
  useLocation.mockReturnValue({ state: { tutoring: null } });

  confirmSchedule.mockResolvedValue({});

  await renderChooseScheduleByTutor();

  fireEvent.click(screen.getByLabelText(/10:00/i));

  const [horaInicio, horaFin] = screen.getAllByTestId("time-input");
  fireEvent.change(horaInicio, { target: { value: "10:00" } });
  fireEvent.change(horaFin, { target: { value: "11:30" } });

  fireEvent.click(screen.getByText(/Confirmar/i));

  await waitFor(() => {
    expect(showSuccess).toHaveBeenCalledWith("Tutoría confirmada con éxito.");
  });
});
