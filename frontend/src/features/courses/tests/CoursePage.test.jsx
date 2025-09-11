// IMPORTANTE!: Mocks antes de cualquier import que los use, porque si intenta importarlos antes de que sean mockeados, falla
//porque Jest no sabe interpretar import.meta, que se usa en courseService.js

//si se quisieran usar los servicios reales hay que hacer otra configuracion, hay que crear un archivo config en el source con 
//export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; y modificar los fetch (ver rama testing_listar_materias)

jest.mock("../hooks/useCourses", () => ({
  useCourses: jest.fn(),
}));

jest.mock("../hooks/useFiltredCourses", () => ({
  useFilteredCourses: jest.fn((courses) => courses),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import CoursePage from "../pages/CoursePage";
import { useCourses } from "../hooks/useCourses";

jest.mock("../hooks/useCourses");

describe("CoursePage", () => {
  const mockSetPage = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("muestra el loading al inicio", () => {
    useCourses.mockReturnValue({
      courses: [],
      loading: true,
      error: null,
      pagination: {},
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);
    expect(screen.getByText(/cargando materias/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error si hay error", () => {
    useCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: "Error",
      pagination: {},
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);
    expect(screen.getByText(/error al cargar las materias/i)).toBeInTheDocument();
  });

  it("muestra los cursos y la paginación", () => {
    useCourses.mockReturnValue({
      courses: [
        { id: 1, name: "Curso A" },
        { id: 2, name: "Curso B" },
      ],
      loading: false,
      error: null,
      pagination: { page: 1, last: 3 },
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);

    // Verifica que los cursos se muestren
    expect(screen.getByText("Curso A")).toBeInTheDocument();
    expect(screen.getByText("Curso B")).toBeInTheDocument();

    // Verifica que la paginación tenga botones
    const nextButton = screen.getByText(">");
    fireEvent.click(nextButton);
    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("muestra 'No hay materias disponibles' si no hay cursos", () => {
    useCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
      pagination: { page: 1, last: 1 },
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);
    expect(screen.getByText(/no hay materias disponibles/i)).toBeInTheDocument();
  });
});