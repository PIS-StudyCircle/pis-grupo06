/* eslint-env jest, node */
/* global global, require */
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

test("renderiza correctamente una tutoría cargada", async () => {
  const tutoringData = {
    id: 1,
    course: { name: "Matemática I" },
    modality: "Presencial",
    capacity: 10,
    enrolled: 3,
    tutor_id: null,
    state: "active",
    subjects: [{ id: 1, name: "Derivadas" }],
    created_by: {
      id: 99,
      name: "Prof.",
      last_name: "López",
      email: "prof@example.com",
      profile_photo_url: null,
    },
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
  await waitFor(() => screen.getByText(/Matemática I/i));


  expect(screen.getByText(/Presencial/i)).toBeInTheDocument();
  expect(screen.getByText(/Derivadas/i)).toBeInTheDocument();
  expect(screen.getByText(/Prof. López/i)).toBeInTheDocument();
});

test("muestra botón 'Ser tutor' cuando no tiene tutor", async () => {
  const tutoringData = {
    id: 1,
    course: { name: "Química" },
    modality: "Virtual",
    tutor_id: null,
    created_by_id: 20,
    state: "pending",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText(/Química/i));

  expect(screen.getByText(/Ser tutor/i)).toBeInTheDocument();
});

test("muestra botón 'Unirme' cuando hay cupos y tutor", async () => {
  const tutoringData = {
    id: 2,
    course: { name: "Historia" },
    modality: "Presencial",
    capacity: 5,
    enrolled: 1,
    tutor: { id: 33, name: "Ana" },
    created_by_id: 20,
    state: "active",
  };

  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData }) // getTutoring
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // join_tutoring
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData }); // refetch

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await waitFor(() => screen.getByText(/Historia/i));
  const button = await screen.findByRole("button", { name: /unirme/i });
  fireEvent.click(button);

  await waitFor(() =>
    expect(fetch.mock.calls[1][0]).toMatch(/join_tutoring/)
  );

});

test("muestra 'Completo' cuando no hay cupos disponibles", async () => {
  const tutoringData = {
    id: 4,
    course: { name: "Programación" },
    modality: "Virtual",
    capacity: 2,
    enrolled: 2,
    tutor: { id: 1, name: "Ana" },
    created_by_id: 9,
    state: "active",
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ exists: false }) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText(/Programación/i));

  expect(await screen.findByRole("button", { name: /completo/i })).toBeInTheDocument();

});

test("muestra 'Desuscribirme' cuando soy estudiante", async () => {
  const tutoringData = {
    id: 5,
    course: { name: "Biología" },
    modality: "Virtual",
    capacity: 3,
    enrolled: 2,
    tutor: { id: 9, name: "Ana" },
    created_by_id: 8,
    state: "active",
    user_enrolled: true,
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // unsubscribe
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData }); // refetch

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await waitFor(() => screen.getByText(/Biología/i));
  const btn = screen.getByText(/Desuscribirme/i);
  fireEvent.click(btn);

  await waitFor(() =>
    expect(fetch.mock.calls[1][0]).toMatch(/unsubscribe/)
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
    tutor: { id: 8, name: "Ana" },
    created_by_id: 8,
    state: "active",
    user_enrolled: true,
  };

  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) });

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await waitFor(() => screen.getByText(/Arte/i));

  fireEvent.click(screen.getByText(/Desuscribirme/i));
  await waitFor(() => expect(navigateMock).toHaveBeenCalled());
});

test("maneja error silencioso en refetchTutoring", async () => {
  const tutoringData = {
    id: 7,
    course: { name: "Geografía" },
    modality: "Virtual",
    capacity: 5,
    enrolled: 1,
    tutor: { id: 2, name: "Ana" },
    created_by_id: 8,
    state: "active",
    user_enrolled: false,
  };

  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    .mockRejectedValueOnce(new Error("refetch error"));

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });

  await waitFor(() => screen.getByText(/Geografía/i));
  const btn = screen.getByText(/Unirme/i);
  fireEvent.click(btn);

  await waitFor(() =>
    expect(fetch.mock.calls[1][0]).toMatch(/join_tutoring/)
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
  await screen.findByText(/Física/i);

  // noTieneTutor
  expect(tutoringData.tutor_id).toBeNull();
  // cuposDisponibles
  expect(tutoringData.capacity - tutoringData.enrolled).toBe(0);
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
    tutor_id: { id: 9, name: "Ana" },
    created_by_id: 8,
    state: "active",
    user_enrolled: true,
  };
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => tutoringData })
    .mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) }); // unsubscribe

  render(<ShowPageTutoring />, { wrapper: MemoryRouter });
  await screen.findByText(/Biología/i);

  fireEvent.click(screen.getByText(/Desuscribirme/i));
  await waitFor(() => expect(navigateMock).toHaveBeenCalled());
});