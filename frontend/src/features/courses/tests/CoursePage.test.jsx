// IMPORTANTE!: Mocks antes de los imports
jest.mock("../../../shared/components/layout/NavBar", () => () => <div>NavBar</div>);
jest.mock("../../../shared/components/Footer", () => () => <div>Footer</div>);
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));
jest.mock("@context/UserContext", () => ({
  useUser: jest.fn().mockReturnValue({ user: null }),
}));
jest.mock("../services/courseService", () => ({
  getCourses: jest.fn(),
}));

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CoursePage from "../pages/CoursePage";
import { getCourses } from "../services/courseService";

describe("Tests de página de materias", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("muestra el loading al inicio", async () => {
    getCourses.mockImplementation(() => new Promise(() => {}));
    render(<CoursePage />);
    expect(screen.getByText(/cargando materias/i)).toBeInTheDocument();
  });

  it("muestra mensaje de error si el fetch falla", async () => {
    getCourses.mockRejectedValueOnce(new Error("Error fetching courses"));
    render(<CoursePage />);
    await waitFor(() => {
      expect(screen.getByText(/error al cargar las materias/i)).toBeInTheDocument();
    });
  });

  it("muestra los cursos correctamente", async () => {
    getCourses.mockResolvedValueOnce({
      courses: [
        { id: 1, name: "Curso A" },
        { id: 2, name: "Curso B" },
      ],
      pagination: { last: 1, current: 1 },
    });

    render(
      <MemoryRouter>
        <CoursePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Curso A")).toBeInTheDocument();
      expect(screen.getByText("Curso B")).toBeInTheDocument();
    });
  });

  it("muestra mensaje vacío cuando no hay cursos", async () => {
    getCourses.mockResolvedValueOnce({
      courses: [],
      pagination: { last: 1, current: 1 },
    });
    render(<CoursePage />);
    await waitFor(() => {
      expect(screen.getByText(/no hay materias disponibles/i)).toBeInTheDocument();
    });
  });

  it("realiza nueva búsqueda al escribir en el input", async () => {
    getCourses.mockResolvedValueOnce({
      courses: [],
      pagination: { last: 1, current: 1 },
    });
    render(<CoursePage />);
    const input = screen.getByPlaceholderText(/buscar materia/i);

    // Simula escribir algo en la búsqueda
    fireEvent.change(input, { target: { value: "mat" } });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    // el hook llama nuevamente al service con el query actualizado
    await waitFor(() => {
      expect(getCourses).toHaveBeenCalledWith(
        expect.any(Number), // page
        expect.any(Number), // perPage
        "mat", // search
        expect.any(Boolean) // showFavorites
      );
    });
  });
});