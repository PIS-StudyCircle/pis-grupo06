import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SubjectPage from "../pages/SubjectPage";
import * as subjectService from "../services/subjectService";

// Mockeamos todo el módulo
jest.mock("../services/subjectService");

describe("SubjectPage", () => {
  const mockSubjects = [
    { id: 1, name: "Tema I" },
    { id: 2, name: "Tema II" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  
  afterEach(() => {
    console.error.mockRestore();
  });

  it("renderiza el título y la lista de temas", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: mockSubjects,
      pagination: { last: 1 },
    });

    render(
      <MemoryRouter>
        <SubjectPage courseId={123} />
      </MemoryRouter>
    );

    expect(await screen.findByText("Temas")).toBeInTheDocument();
    expect(await screen.findByText("Tema I")).toBeInTheDocument();
    expect(await screen.findByText("Tema II")).toBeInTheDocument();
  });

  it("muestra checkboxes si showCheckbox es true", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: mockSubjects,
      pagination: { last: 1 },
    });

    render(
      <MemoryRouter>
        <SubjectPage courseId={123} showCheckbox={true} />
      </MemoryRouter>
    );

    expect(await screen.findByText("Tema I")).toBeInTheDocument();
    expect(await screen.findByText("Tema II")).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
  });

  it("muestra mensaje de carga inicialmente", () => {
    subjectService.getSubjects.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <SubjectPage courseId={123} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando temas/i)).toBeInTheDocument();
  });

  it("muestra error si falla la API", async () => {
    subjectService.getSubjects.mockRejectedValue(new Error("Fallo API"));
  
    render(
      <MemoryRouter>
        <SubjectPage courseId={123} />
      </MemoryRouter>
    );
  
    expect(await screen.findByText("Error al cargar los temas.")).toBeInTheDocument();
  });

  it("abre el formulario de crear nuevo tema y valida campos", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: mockSubjects,
      pagination: { last: 1 },
    });

    render(
      <MemoryRouter>
        <SubjectPage courseId={123} showButton={true} />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("+ Crear Nuevo Tema"));

    expect(screen.getByLabelText("Nombre del tema")).toBeInTheDocument();

    // Validación requerida
    fireEvent.click(screen.getByText("Guardar"));
    expect(await screen.findByText(/El Nombre es obligatorio/i)).toBeInTheDocument();
  });

  it("llama a createSubject y resetea el formulario", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: [
        { id: 1, name: "Tema I" },
        { id: 2, name: "Tema II" },
      ],
      pagination: { last: 1 },
    });
  
    const mockCreated = { id: 3, name: "Tema III" };
    // Espiamos la función createSubject y la mockeamos
    const createSubjectMock = jest
      .spyOn(subjectService, "createSubject")
      .mockResolvedValue(mockCreated);
  
    const onCreated = jest.fn();
  
    render(
      <MemoryRouter>
        <SubjectPage courseId={123} showButton={true} onCreated={onCreated} />
      </MemoryRouter>
    );
  
    fireEvent.click(await screen.findByText("+ Crear Nuevo Tema"));
    fireEvent.change(screen.getByLabelText("Nombre del tema"), {
      target: { value: "Tema III" },
    });
    fireEvent.click(screen.getByText("Guardar"));
  
    expect(createSubjectMock).toHaveBeenCalledWith({
      name: "Tema III",
      course_id: 123,
    });
  
    expect(onCreated).toHaveBeenCalled();
  });

  it("muestra error si falla la creación del tema", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: mockSubjects,
      pagination: { last: 1 },
    });

    subjectService.createSubject.mockRejectedValue({ message: "Fallo API" });

    render(
      <MemoryRouter>
        <SubjectPage courseId={123} showButton={true} />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("+ Crear Nuevo Tema"));
    fireEvent.change(screen.getByLabelText("Nombre del tema"), { target: { value: "Tema III" } });
    fireEvent.click(screen.getByText("Guardar"));

    expect(await screen.findByText(/Error al crear el tema/i)).toBeInTheDocument();
  });
});