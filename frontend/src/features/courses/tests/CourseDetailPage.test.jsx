import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CourseDetailPage from "../pages/CourseDetailPage";
import * as courseService from "../services/courseService";

jest.mock("@components/layout/NavBar", () => () => <div>NavBar</div>);
jest.mock("@components/Footer", () => () => <div>Footer</div>);

jest.mock("../services/courseService", () => ({
    getCourseByID: jest.fn(() => Promise.resolve({ id: 1, name: "Test course" })),
}));

jest.mock("@/features/subjects/pages/SubjectPage", () => (props) => (
  <div>Mock SubjectPage - courseId: {props.courseId}</div>
));

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

function renderWithRouter(courseId = "1") {
    return render(
        <MemoryRouter initialEntries={[`/materias/${courseId}`]}>
            <Routes>
                <Route path="/materias/:courseId" element={<CourseDetailPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("CourseDetailPage", () => {
  it("muestra el loading", async () => {
    jest.spyOn(courseService, "getCourseByID").mockImplementation(
      () => new Promise(() => {}) // nunca resuelve → se queda en loading
    );

    renderWithRouter("1");

    expect(await screen.getByText(/Cargando curso/i)).toBeInTheDocument();
  });

  it("muestra error si falla la API", async () => {
    jest.spyOn(courseService, "getCourseByID").mockRejectedValue(
      new Error("Fallo API")
    );

    renderWithRouter("1");

    await waitFor(() =>
      expect(screen.getByText(/Error: Fallo API/i)).toBeInTheDocument()
    );
  });

  it("muestra 'no se encontró el curso' si la API devuelve null", async () => {
    jest.spyOn(courseService, "getCourseByID").mockResolvedValue(null);

    renderWithRouter("1");

    await waitFor(() =>
      expect(
        screen.getByText(/No se encontró el curso/i)
      ).toBeInTheDocument()
    );
  });

  it("renderiza los datos de un curso", async () => {
    jest.spyOn(courseService, "getCourseByID").mockResolvedValue({
      id: 1,
      name: "Curso Test",
      code: "C123",
      institute: "Instituto X",
      description: "Descripción de prueba",
      subjects: [{ id: 10, name: "Tema 1" }],
    });

    renderWithRouter("1");

    expect(await screen.findByText("Curso Test")).toBeInTheDocument();
    expect(screen.getByText(/Código:/)).toBeInTheDocument();
    expect(screen.getByText(/Instituto:/)).toBeInTheDocument();
    expect(screen.getByText(/Mock SubjectPage/)).toBeInTheDocument();
  });

  it("muestra el curso aunque no tenga código ni instituto", async () => {
    jest.spyOn(courseService, "getCourseByID").mockResolvedValue({
      id: 1,
      name: "Curso Sin Info",
      description: "Descripción disponible",
      subjects: [{ id: 10, name: "Tema 1" }],
      code: null,
      institute: null,
    });
  
    renderWithRouter("1");
  
    expect(await screen.findByText("Curso Sin Info")).toBeInTheDocument();
    expect(screen.queryByText(/Código:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Instituto:/)).not.toBeInTheDocument();
    expect(screen.getByText("Descripción disponible")).toBeInTheDocument();
  });

  it("muestra el curso aunque no tenga descripción", async () => {
    jest.spyOn(courseService, "getCourseByID").mockResolvedValue({
      id: 1,
      name: "Curso Sin Descripción",
      code: "C999",
      institute: "Instituto Y",
      description: null,
      subjects: [{ id: 10, name: "Tema 1" }],
    });
  
    renderWithRouter("1");
  
    expect(await screen.findByText("Curso Sin Descripción")).toBeInTheDocument();
    expect(screen.getByText(/Código:/)).toBeInTheDocument();
    expect(screen.getByText(/Instituto:/)).toBeInTheDocument();
  });
  
  it("tiene elementos accesibles", async () => {
    jest.spyOn(courseService, "getCourseByID").mockResolvedValue({
      id: 1,
      name: "Curso Accesible",
      subjects: [],
    });
    renderWithRouter("1");
  
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Curso Accesible");
  
    expect(screen.getByRole("button", { name: /Brindar tutoría/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Recibir tutoría/i })).toBeInTheDocument();
  });

  it("los botones navegan a las páginas correctas", async () => {
    jest.spyOn(courseService, "getCourseByID").mockResolvedValue({
      id: 1,
      name: "Curso Test",
      code: "C123",
      institute: "Instituto X",
      subjects: [],
    });
  
    renderWithRouter("1");
  
    // Esperamos que el curso cargue
    await screen.findByText("Curso Test");

    // Botón "Brindar tutoría"
    const tutorButton = screen.getByText(/Brindar tutoría/i);
    tutorButton.click();
    expect(mockedNavigate).toHaveBeenCalledWith("/tutorias/ser_tutor/1");
  
    // Botón "Recibir tutoría"
    const tutoriaButton = screen.getByText(/Recibir tutoría/i);
    tutoriaButton.click();
    expect(mockedNavigate).toHaveBeenCalledWith("/tutorias/materia/1");
  });
  
});
