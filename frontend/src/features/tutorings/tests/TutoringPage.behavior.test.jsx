import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithRouter, mockUseTutorings, baseTutorings, setPageMock, setSearchMock } from "./TutoringPage.testUtils";
import TutoringPage from "../pages/TutoringPage";
import TutoringCard from "../components/TutoringCard";

describe("TutoringPage - Comportamiento general", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTutorings({ tutorings: baseTutorings });
  });

  it("renderiza título y lista de tutorías", async () => {
    renderWithRouter(<TutoringPage />);
    expect(await screen.findByText("Álgebra")).toBeInTheDocument();
    expect(screen.getByText("Física")).toBeInTheDocument();
  });

  it("muestra mensaje cuando no hay tutorías disponibles", async () => {
    mockUseTutorings({ tutorings: [], error: null });
    renderWithRouter(<TutoringPage />);
    await waitFor(() => {
      expect(screen.getByText(/No hay tutorías disponibles para esta materia/i)).toBeInTheDocument();
    });
  });

  it("muestra mensaje de error si la carga falla", async () => {
    mockUseTutorings({ tutorings: [], error: "Error al cargar tutorías" });
    renderWithRouter(<TutoringPage />);
    await waitFor(() => {
      expect(screen.getByText(/Error al cargar las tutorías/i)).toBeInTheDocument();
    });
  });

  it("muestra mensaje de carga cuando loading es true", () => {
    mockUseTutorings({ loading: true, tutorings: [] });
    renderWithRouter(<TutoringPage />);
    expect(screen.getByText(/Cargando tutorías.../i)).toBeInTheDocument();
  });
});

describe("TutoringPage - Comportamiento completo", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseTutorings({ tutorings: baseTutorings });
    });
  
    it("renderiza título y lista con tutorías disponibles", async () => {
        mockUseTutorings({ tutorings: baseTutorings });
      
        renderWithRouter(<TutoringPage />);
      
        // Esperamos a que aparezca el título
        expect(await screen.findByText(/Tutorías Disponibles/i)).toBeInTheDocument();
      
        // Validamos que cada tutoría se renderizó con su materia y tutor
        for (const tutoring of baseTutorings) {
          const tutorFullName = tutoring.tutor_id
            ? `${tutoring.tutor_name} ${tutoring.tutor_last_name}`
            : /sin tutor/i;
      
          const courseElements = await screen.findAllByText(new RegExp(tutoring.course.name, "i"));
          expect(courseElements.length).toBeGreaterThan(0); // al menos una coincidencia
      
          if (tutoring.tutor_id) {
            const tutorElements = await screen.findAllByText(new RegExp(tutorFullName, "i"));
            expect(tutorElements.length).toBeGreaterThan(0);
          }
        }
    });
  
    it("renderiza botón de acción cuando mode='serTutor'", () => {
      mockUseTutorings();
  
      renderWithRouter(<TutoringPage mode="serTutor" />);
  
      expect(screen.getByRole("button", { name: /Crear nueva tutoría/i })).toBeInTheDocument();
    });
  
    it("renderiza botón de acción cuando mode='serEstudiante'", () => {
      mockUseTutorings();
  
      renderWithRouter(<TutoringPage mode="serEstudiante" />);
  
      expect(screen.getByRole("button", { name: /Solicitar nueva tutoría/i })).toBeInTheDocument();
    });
  
    it("no renderiza botón pero sí toggle cuando mode diferente", () => {
      mockUseTutorings();
  
      renderWithRouter(<TutoringPage mode="other" />);
  
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Tutor Indefinido/i)).toBeInTheDocument();
    });
  
    it("toggle 'Tutor Indefinido' actualiza mergedFilters", () => {
      mockUseTutorings({ setPage: setPageMock, setSearch: setSearchMock });
  
      renderWithRouter(<TutoringPage mode="other" />);
  
      const toggle = screen.getByLabelText(/Tutor Indefinido/i);
      fireEvent.click(toggle);
  
      expect(toggle).toBeChecked();
    });
  
    it("forceSubjectSearch cambia searchBy automáticamente", () => {
      mockUseTutorings();
      renderWithRouter(<TutoringPage mode="serTutor" />);
  
      const searchBySelect = screen.getByDisplayValue("Tema");
      expect(searchBySelect).toBeInTheDocument();
    });
  
    it("efecto de debounce llama a setSearch y setPage", async () => {
      
        mockUseTutorings({ setSearch: setSearchMock, setPage: setPageMock });
      
        renderWithRouter(<TutoringPage />);
        
        const input = screen.getByPlaceholderText(/Buscar por materia/i);
        fireEvent.change(input, { target: { value: "React" } });
      
        await waitFor(() => {
          expect(setSearchMock).toHaveBeenCalledWith("React");
          expect(setPageMock).toHaveBeenCalledWith(1);
        });
    });
  
    it("cambia página al cambiar searchBy", () => {
      mockUseTutorings({ setPage: setPageMock });
  
      renderWithRouter(<TutoringPage />);
  
      // cambiar searchBy de course a subject
      const select = screen.getByDisplayValue("Materia");
      fireEvent.change(select, { target: { value: "subject" } });
  
      expect(setPageMock).toHaveBeenCalledWith(1);
    });

    it("renderiza tutorías con todos los modos de TutoringCard", () => {
        const tutorings = [
          // Tutor definido, subjects <=5
          {
            ...baseTutorings[0],
            subjects: baseTutorings[0].subjects,
            tutor_id: 1,
          },
          // Sin tutor
          {
            ...baseTutorings[1],
            tutor_id: null,
            tutor_name: "",
            tutor_last_name: "",
            tutor_email: "",
          },
          // Subjects >5
          {
            ...baseTutorings[2],
            subjects: Array.from({ length: 7 }, (_, i) => ({ id: i, name: `Tema ${i}` })),
            tutor_id: 2,
          },
          // Sin fecha ni duración
          {
            ...baseTutorings[0],
            scheduled_at: null,
            duration_mins: null,
            tutor_id: 3,
          },
        ];
      
        mockUseTutorings({ tutorings });
      
        renderWithRouter(<TutoringPage mode="serTutor" />);
      
        // Revisar que se renderizan los nombres de materias
        expect(screen.getAllByText(/Álgebra/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Física/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Química/i).length).toBeGreaterThan(0);
      
        // Revisar botones "Ser tutor" (modo page)
        expect(screen.getAllByRole("button", { name: /Ser tutor/i }).length).toBeGreaterThan(0);
      
        // Revisar +N en subjects
        expect(screen.getByText("+2")).toBeInTheDocument(); // 7 - 5
      
        // Revisar que tutor ausente no se muestre
        expect(screen.getAllByText(/Juan Pérez/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Ana García/i).length).toBeGreaterThan(0);
        // tutor_id null → no aparece nombre
        // Buscar la tutoría de Física
        const fisicaElements = screen.getAllByText(/Física/i);

        // Asegurarse de que ninguna de esas tarjetas tenga tutor
        fisicaElements.forEach((el) => {
        const cardDiv = el.closest("div"); // ahora es un elemento, no el array
        expect(cardDiv.textContent).not.toMatch(/Juan Pérez|Ana García/);
        });
      
        // Revisar que las tutorías sin fecha/duración no rompen el render
        expect(screen.getAllByText(/Álgebra/i).length).toBeGreaterThan(0);
      });

      it("renderiza botones según mode en TutoringCard", () => {
        const tutoring = baseTutorings[0];
      
        const { rerender } = renderWithRouter(<TutoringCard tutoring={tutoring} mode="serTutor" />);
        expect(screen.getByRole("button", { name: /Ser tutor/i })).toBeInTheDocument();
      
        rerender(<TutoringCard tutoring={tutoring} mode="serEstudiante" />);
        expect(screen.getByRole("button", { name: /Unirme/i })).toBeInTheDocument();
      
        rerender(<TutoringCard tutoring={tutoring} mode="ambos" />);
        expect(screen.getByRole("button", { name: /Ser tutor/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Unirme/i })).toBeInTheDocument();
      
        rerender(<TutoringCard tutoring={tutoring} mode="misTutorias" />);
        expect(screen.getByRole("button", { name: /Desuscribirme/i })).toBeInTheDocument();
      
        rerender(<TutoringCard tutoring={tutoring} mode="completo" />);
        expect(screen.getByRole("button", { name: /Completo/i })).toBeInTheDocument();
      });
});