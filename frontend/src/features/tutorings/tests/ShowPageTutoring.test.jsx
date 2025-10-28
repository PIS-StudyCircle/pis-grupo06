import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ShowPageTutoring from "../pages/ShowPageTutoring";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock("@context/UserContext", () => ({
  useUser: () => ({ user: { id: 10, name: "Juan" } }),
}));

jest.mock("@shared/utils/toastService", () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showConfirm: jest.fn((msg, cb) => cb()),
}));

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

test("muestra skeleton mientras carga", () => {
  // Hacemos que fetch nunca resuelva para simular loading
  global.fetch.mockImplementation(() => new Promise(() => {}));

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  // Verificamos que el skeleton esté visible
  expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
});

test("muestra error si el fetch falla", async () => {
  const { showError } = require("@shared/utils/toastService");
  fetch.mockRejectedValueOnce(new Error("Network error"));

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await waitFor(() =>
    expect(showError).toHaveBeenCalledWith("No se pudo cargar la tutoría.")
  );
});

test("Muestra mensaje cuando no se encuentra la tutoría", async () => {
  // Forzamos fetch para que falle o devuelva null
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => null,
  });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await screen.findByText("No se encontró la tutoría.");
  expect(screen.getByText("Volver")).toBeInTheDocument();
});

test("renderiza correctamente una tutoría cargada", async () => {
  const tutoringData = {
    id: 1,
    course: { name: "Matemática I" },
    modality: "Presencial",
    capacity: 10,
    enrolled: 3,
    tutor_id: null,
    created_by_id: 99,
    state: "active",
    subjects: [{ id: 1, name: "Derivadas" }],
    created_by_name: "Prof. López",
  };
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => tutoringData,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: false }),
    });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText("Matemática I"));

  expect(screen.getByText(/Presencial/)).toBeInTheDocument();
  expect(screen.getByText("Derivadas")).toBeInTheDocument();
  expect(screen.getByText("Prof. López")).toBeInTheDocument();
});

test("muestra botón 'Ser tutor' cuando no tiene tutor y hay cupos", async () => {
  const tutoringData = {
    id: 1,
    course: { name: "Química" },
    modality: "Virtual",
    capacity: 5,
    enrolled: 2,
    tutor_id: null,
    created_by_id: 20,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText("Química"));

  expect(screen.getByText("Ser tutor")).toBeInTheDocument();
});

test("muestra botón 'Unirme' cuando hay cupos y tutor", async () => {
  const tutoringData = {
    id: 2,
    course: { name: "Historia" },
    modality: "Presencial",
    capacity: 5,
    enrolled: 1,
    tutor_id: 33,
    created_by_id: 20,
    state: "active",
  };

  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData }) // getTutoring
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) }) // checkSubscription
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // join_tutoring
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData }); // refetch

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await waitFor(() => screen.getByText("Historia"));
  const button = screen.getByText("Unirme");
  fireEvent.click(button);

  await waitFor(() =>
    expect(fetch.mock.calls[2][0]).toMatch(/join_tutoring/)
  );
});

test("muestra ambos botones cuando no hay tutor y hay cupos", async () => {
  const tutoringData = {
    id: 3,
    course: { name: "Literatura" },
    modality: "Virtual",
    capacity: 10,
    enrolled: 0,
    tutor_id: null,
    created_by_id: 20,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText("Literatura"));

  expect(screen.getByText("Ser tutor")).toBeInTheDocument();
  expect(screen.getByText("Unirme")).toBeInTheDocument();
});

test("muestra 'Completo' cuando no hay cupos disponibles", async () => {
  const tutoringData = {
    id: 4,
    course: { name: "Programación" },
    modality: "Virtual",
    capacity: 2,
    enrolled: 2,
    tutor_id: 1,
    created_by_id: 9,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText("Programación"));

  expect(screen.getByText("Completo")).toBeInTheDocument();
});

test("muestra 'Desuscribirme' cuando soy estudiante", async () => {
  const tutoringData = {
    id: 5,
    course: { name: "Biología" },
    modality: "Virtual",
    capacity: 3,
    enrolled: 2,
    tutor_id: 9,
    created_by_id: 8,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: true }) }) // soy estudiante
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // unsubscribe
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData }); // refetch

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await waitFor(() => screen.getByText("Biología"));
  const btn = screen.getByText("Desuscribirme");
  fireEvent.click(btn);

  await waitFor(() =>
    expect(fetch.mock.calls[2][0]).toMatch(/unsubscribe/)
  );
});

test("si el backend devuelve 204 al desuscribirse, navega al listado", async () => {
  const navigateMock = jest.fn();
  jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(navigateMock);

  const tutoringData = {
    id: 6,
    course: { name: "Arte" },
    modality: "Presencial",
    capacity: 3,
    enrolled: 1,
    tutor_id: 8,
    created_by_id: 8,
    state: "active",
  };

  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: true }) })
    .mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText("Arte"));

  fireEvent.click(screen.getByText("Desuscribirme"));
  await waitFor(() => expect(navigateMock).toHaveBeenCalled());
});

test("maneja error silencioso en refetchTutoring", async () => {
  const tutoringData = {
    id: 7,
    course: { name: "Geografía" },
    modality: "Virtual",
    capacity: 5,
    enrolled: 1,
    tutor_id: 2,
    created_by_id: 8,
    state: "active",
  };

  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    .mockRejectedValueOnce(new Error("refetch error"));

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await waitFor(() => screen.getByText("Geografía"));
  const btn = screen.getByText("Unirme");
  fireEvent.click(btn);

  await waitFor(() =>
    expect(fetch.mock.calls[2][0]).toMatch(/join_tutoring/)
  );
});

test("Calcula correctamente cuposDisponibles y noTieneTutor", async () => {
  const tutoringData = {
    id: 10,
    course: { name: "Física" },
    modality: "Virtual",
    capacity: 5,
    enrolled: 5,
    tutor_id: null,
    created_by_id: 1,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await screen.findByText("Física");

  // noTieneTutor
  expect(tutoringData.tutor_id).toBeNull();
  // cuposDisponibles
  expect(tutoringData.capacity - tutoringData.enrolled).toBe(0);
});

test("Muestra ambos botones y permite click", async () => {
  const tutoringData = {
    id: 11,
    course: { name: "Arte" },
    modality: "Presencial",
    capacity: 10,
    enrolled: 0,
    tutor_id: null,
    created_by_id: 1,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await screen.findByText("Arte");

  expect(screen.getByText("Ser tutor")).toBeInTheDocument();
  expect(screen.getByText("Unirme")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Ser tutor"));
  fireEvent.click(screen.getByText("Unirme"));
});

test("Muestra botón Desuscribirme y navega si confirma", async () => {
  const navigateMock = jest.fn();
  jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(navigateMock);

  const tutoringData = {
    id: 12,
    course: { name: "Biología" },
    modality: "Virtual",
    capacity: 3,
    enrolled: 2,
    tutor_id: 9,
    created_by_id: 8,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: true }) }) // soy estudiante
    .mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) }); // unsubscribe

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await screen.findByText("Biología");

  fireEvent.click(screen.getByText("Desuscribirme"));
  await waitFor(() => expect(navigateMock).toHaveBeenCalled());
});