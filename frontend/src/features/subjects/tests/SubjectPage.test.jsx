import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("renderiza loading, lista de temas y paginación", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: mockSubjects,
      pagination: { last: 3 },
    });

    render(
      <MemoryRouter>
        <SubjectPage courseId={123} />
      </MemoryRouter>
    );

    // Loading
    expect(screen.getByText(/Cargando temas/i)).toBeInTheDocument();

    // Lista
    expect(await screen.findByText("Tema I")).toBeInTheDocument();
    expect(screen.getByText("Tema II")).toBeInTheDocument();

    // Paginación
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("muestra mensaje cuando no hay temas disponibles", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: [],
      pagination: { last: 1 },
    });
  
    render(
      <MemoryRouter>
        <SubjectPage courseId={123} />
      </MemoryRouter>
    );
  
    expect(await screen.findByText("No hay temas disponibles.")).toBeInTheDocument();
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

  it("muestra la fecha de vencimiento si existe", async () => {
    const subjectsWithDueDate = [
      { id: 1, name: "Tema I", due_date: "2025-09-30T12:00:00Z" }
    ];

  
    subjectService.getSubjects.mockResolvedValue({
      subjects: subjectsWithDueDate,
      pagination: { last: 1 },
    });
  
    render(
      <MemoryRouter>
        <SubjectPage courseId={123} />
      </MemoryRouter>
    );
  
    // Verifica que el tema se muestre
    expect(await screen.findByText("Tema I")).toBeInTheDocument();
  
    // Verifica que la fecha de vencimiento se muestre formateada
    expect(screen.getByText(/Vencimiento:\s*30\/9\/2025/)).toBeInTheDocument();
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
    const initialSubjects = [
      { id: 1, name: "Tema I" },
      { id: 2, name: "Tema II" },
    ];
  
    const createdSubject = { id: 3, name: "Tema III" };
  
    // Primero, getSubjects devuelve los temas iniciales
    subjectService.getSubjects.mockResolvedValue({
      subjects: initialSubjects,
      pagination: { last: 1 },
    });
  
    // Mock de createSubject
    jest.spyOn(subjectService, "createSubject").mockResolvedValue(createdSubject);
  
    render(
      <MemoryRouter>
        <SubjectPage courseId={123} showButton={true} />
      </MemoryRouter>
    );
  
    // Abrir formulario
    fireEvent.click(await screen.findByText("+ Crear Nuevo Tema"));
    fireEvent.change(screen.getByLabelText("Nombre del tema"), {
      target: { value: "Tema III" },
    });
  
    // Mockear getSubjects para que devuelva el nuevo tema después de la creación
    subjectService.getSubjects.mockResolvedValue({
      subjects: [...initialSubjects, createdSubject],
      pagination: { last: 1 },
    });
  
    fireEvent.click(screen.getByText("Guardar"));
  
    // Esperamos a que aparezca el nuevo tema
    await waitFor(() => {
      expect(screen.getByText(/Tema III/i)).toBeInTheDocument();
    });
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

    expect(await screen.findByText(/Fallo API/i)).toBeInTheDocument();
  });

  it("maneja la selección de checkboxes si showCheckbox es true", async () => {
    subjectService.getSubjects.mockResolvedValue({
      subjects: mockSubjects,
      pagination: { last: 1 },
    });

    render(
      <MemoryRouter>
        <SubjectPage courseId={123} showCheckbox={true} />
      </MemoryRouter>
    );

    const checkboxes = await screen.findAllByRole("checkbox");

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });
  
  it("actualiza search y resetea page cuando cambia la query (debounce)", async () => {
    jest.useFakeTimers();
  
    subjectService.getSubjects.mockResolvedValue({
      subjects: mockSubjects,
      pagination: { last: 1 },
    });
  
    render(
      <MemoryRouter>
        <SubjectPage courseId={123} />
      </MemoryRouter>
    );
  
    const input = await screen.findByPlaceholderText("Buscar tema...");
    fireEvent.change(input, { target: { value: "Nuevo Tema" } });
  
    // Avanzar 400ms para que se ejecute el debounce
    jest.advanceTimersByTime(400);
  
    await waitFor(() => {
      expect(subjectService.getSubjects).toHaveBeenCalledWith(
        123,
        1,
        10,
        "Nuevo Tema"
      );
    });
  
    jest.useRealTimers();
  });
  
  it("resetea la página a 1 si page !== 1 al crear un tema", async () => {
    const initialSubjects = [
      { id: 1, name: "Tema I" },
      { id: 2, name: "Tema II" },
    ];
    const createdSubject = { id: 3, name: "Tema III" };
  
    // getSubjects inicial devuelve temas
    subjectService.getSubjects.mockResolvedValue({
      subjects: initialSubjects,
      pagination: { last: 3 },
    });
  
    jest.spyOn(subjectService, "createSubject").mockResolvedValue(createdSubject);
  
    render(
      <MemoryRouter>
        <SubjectPage courseId={123} showButton={true} initialPage={2} />
      </MemoryRouter>
    );
  
    // Abrir formulario
    fireEvent.click(await screen.findByText("+ Crear Nuevo Tema"));
    fireEvent.change(screen.getByLabelText("Nombre del tema"), {
      target: { value: "Tema III" },
    });
  
    // Mockear getSubjects para que devuelva el nuevo tema después de la creación
    subjectService.getSubjects.mockResolvedValue({
      subjects: [...initialSubjects, createdSubject],
      pagination: { last: 3 },
    });
  
    fireEvent.click(screen.getByText("Guardar"));
  
    // Esperamos a que aparezca el nuevo tema
    await waitFor(() => {
      expect(screen.getByText(/Tema III/i)).toBeInTheDocument();
    });
  });
});