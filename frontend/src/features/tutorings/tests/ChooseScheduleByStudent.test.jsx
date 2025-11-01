import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import ChooseScheduleByStudent from "../pages/ChooseScheduleByStudent";
import { useTutoring } from "../hooks/useTutorings";
import { confirmSchedule } from "../services/tutoringService";
import { showSuccess, showError } from "@shared/utils/toastService";

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

async function renderChooseScheduleByStudent() {
  render(
    <MemoryRouter>
      <ChooseScheduleByStudent />
    </MemoryRouter>
  );
}


it("muestra mensaje de carga cuando loading = true", async () => {
  useTutoring.mockReturnValue({ data: null, loading: true, error: null });
  useLocation.mockReturnValue({ state: { tutoring: null } });

  await renderChooseScheduleByStudent();

  expect(screen.getByText(/Cargando horarios/i)).toBeInTheDocument();
});

it("muestra mensaje cuando no hay horarios disponibles", async() => {
  useTutoring.mockReturnValue({
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
  useTutoring.mockReturnValue({
    data: {
      availabilities: [
        { id: 1, start_time: "2025-11-01T10:00:00", end_time: "2025-11-01T12:00:00" },
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
      capacity: 1,
    },
    loading: false,
    error: null,
  });

  useLocation.mockReturnValue({ state: { tutoring: null } });

  // Renderiza la pantalla
  await renderChooseScheduleByStudent();

  // Selecciona el horario
  fireEvent.click(screen.getByLabelText(/10:00/i));

  // Cambia las horas manualmente (inicio y fin)
  const [horaInicio, horaFin] = screen.getAllByTestId("time-input");
  fireEvent.change(horaInicio, { target: { value: "11:30" } });
  fireEvent.change(horaFin, { target: { value: "10:30" } });

  // Intenta confirmar
  fireEvent.click(screen.getByText(/Confirmar/i));

  // Espera a que aparezca el mensaje de error
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
  confirmSchedule.mockResolvedValueOnce({});

  // Renderiza la pantalla
  await renderChooseScheduleByStudent();

  // Selecciona el horario
  fireEvent.click(screen.getByLabelText(/10:00/i));

  // Obtiene los inputs de hora y espera que estén en el DOM
  const [horaInicio, horaFin] = screen.getAllByTestId("time-input");
  fireEvent.change(horaInicio, { target: { value: "10:15" } });
  fireEvent.change(horaFin, { target: { value: "11:00" } });

  // Confirma la tutoría
  fireEvent.click(screen.getByText(/Confirmar/i));

  // Espera a que se llame la función y se muestre el toast
  await waitFor(() => {
    expect(confirmSchedule).toHaveBeenCalled();
    expect(showSuccess).toHaveBeenCalledWith("Tutoría confirmada con éxito.");
  });
});

it("muestra toast de error si confirmSchedule lanza excepción", async () => {
  useTutoring.mockReturnValue({
    data: {
      availabilities: [
        { id: 1, start_time: "2025-11-01T10:00:00", end_time: "2025-11-01T12:00:00" },
      ],
      capacity: 1,
    },
    loading: false,
    error: null,
  });

  useLocation.mockReturnValue({ state: { tutoring: null } });
  confirmSchedule.mockRejectedValueOnce(new Error("Falla en servidor"));

  // Renderiza la pantalla
  await renderChooseScheduleByStudent();

  // Selecciona el horario
  fireEvent.click(screen.getByLabelText(/10:00/i));

  // Espera a que los inputs de hora estén en el DOM
  const [horaInicio, horaFin] = screen.getAllByTestId("time-input");
  fireEvent.change(horaInicio, { target: { value: "10:15" } });
  fireEvent.change(horaFin, { target: { value: "11:00" } });

  // Intenta confirmar
  fireEvent.click(screen.getByText(/Confirmar/i));

  // Espera a que se muestre el toast de error
  await waitFor(() => {
    expect(showError).toHaveBeenCalledWith("Falla en servidor");
  });
});
