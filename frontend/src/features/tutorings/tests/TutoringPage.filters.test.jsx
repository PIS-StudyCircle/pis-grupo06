import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithRouter, mockUseTutorings, baseTutorings } from "./TutoringPage.testUtils";
import TutoringPage from "../pages/TutoringPage";

describe("TutoringPage - Filtros y búsqueda", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTutorings({ tutorings: baseTutorings });
  });

  it("muestra todas las tutorías cuando el filtro está vacío", async () => {
    renderWithRouter(<TutoringPage />);
  
    for (const tutoring of baseTutorings) {
      // Buscamos **todos** los elementos que coincidan con la materia
      const courseElements = await screen.findAllByText(
        new RegExp(tutoring.course.name, "i")
      );
      expect(courseElements.length).toBeGreaterThan(0);
  
      // Buscamos los temas
      for (const subject of tutoring.subjects) {
        const subjectElements = screen.getAllByText(new RegExp(subject.name, "i"));
        expect(subjectElements.length).toBeGreaterThan(0);
      }
    }
  });

  // Filtros por materia
  it("filtra por materia correctamente", async () => {
    renderWithRouter(<TutoringPage />);
    const searchInput = screen.getByPlaceholderText(/Buscar por materia/i);
    fireEvent.change(searchInput, { target: { value: "Física" } });

    await waitFor(() => {
      expect(screen.getAllByText(/Física/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Álgebra/i)).not.toBeInTheDocument();
    });
  });

  it("filtra correctamente con coincidencias parciales de materia", async () => {
    renderWithRouter(<TutoringPage />);
    const searchInput = screen.getByPlaceholderText(/Buscar por materia/i);
    fireEvent.change(searchInput, { target: { value: "Álg" } });

    await waitFor(() => {
      expect(screen.getByText(/Álgebra/i)).toBeInTheDocument();
      expect(screen.queryByText(/Física/i)).not.toBeInTheDocument();
    });
  });

  // Filtros por tema
  it("filtra por tema correctamente", async () => {
    renderWithRouter(<TutoringPage />);
    const searchBySelect = screen.getByLabelText(/Buscar por/i);
    fireEvent.change(searchBySelect, { target: { value: "subject" } });

    const searchInput = screen.getByPlaceholderText(/Buscar por tema/i);
    fireEvent.change(searchInput, { target: { value: "Tema 1" } });

    await waitFor(() => {
      expect(screen.getByText(/Álgebra/i)).toBeInTheDocument();
      expect(screen.queryByText(/Física/i)).not.toBeInTheDocument();
    });
  });

  it("filtra correctamente con coincidencias parciales de tema", async () => {
    renderWithRouter(<TutoringPage />);
    const searchBySelect = screen.getByLabelText(/Buscar por/i);
    fireEvent.change(searchBySelect, { target: { value: "subject" } });

    const searchInput = screen.getByPlaceholderText(/Buscar por tema/i);
    fireEvent.change(searchInput, { target: { value: "Tem" } });

    await waitFor(() => {
      expect(screen.getByText(/Álgebra/i)).toBeInTheDocument(); // tutoría que tiene Tema 1
      expect(screen.queryByText(/Física/i)).not.toBeInTheDocument();
    });
  });

  it("no mezcla resultados entre materias y temas", async () => {
    renderWithRouter(<TutoringPage />);
    const searchBySelect = screen.getByLabelText(/Buscar por/i);
    fireEvent.change(searchBySelect, { target: { value: "subject" } });

    const searchInput = screen.getByPlaceholderText(/Buscar por tema/i);
    fireEvent.change(searchInput, { target: { value: "Química" } });

    await waitFor(() => {
      expect(screen.queryByText(/Química/i)).not.toBeInTheDocument();
    });
  });

  it("muestra solo una tutoría de Química y una de Física sin tutor al activar el toggle", async () => {
    mockUseTutorings({ tutorings: baseTutorings, includeUndefinedTutor: true });
    renderWithRouter(<TutoringPage />);
  
    const toggle = screen.getByLabelText(/Tutor Indefinido/i);
  
    // Activamos el toggle
    fireEvent.click(toggle);
  
    await waitFor(() => {
      // Solo debe aparecer una tutoría de Química sin tutor
      expect(screen.getAllByText(/Química/i)).toHaveLength(1);
      // Solo debe aparecer una tutoría de Física sin tutor
      expect(screen.getAllByText(/Física/i)).toHaveLength(1);
      // Ninguna otra materia debe aparecer
      expect(screen.queryByText(/Álgebra/i)).not.toBeInTheDocument();
    });
  });

  it("aplica filtros combinados y toggle de tutor indefinido", async () => {
    renderWithRouter(<TutoringPage />);
  
    const searchBySelect = screen.getByLabelText(/Buscar por/i);
    const searchInput = screen.getByPlaceholderText(/Buscar por materia/i);
    const undefinedTutorCheckbox = screen.getByRole("checkbox", {
      name: /Tutor Indefinido/i,
    });
  
    // Filtramos por materia "Química"
    fireEvent.change(searchBySelect, { target: { value: "course" } });
    fireEvent.change(searchInput, { target: { value: "Química" } });
  
    // Activamos checkbox de tutor indefinido → solo tutorías sin tutor
    fireEvent.click(undefinedTutorCheckbox);
    await waitFor(() => {
      expect(screen.getAllByText(/Química/i)).toHaveLength(1);
    });
  
    // Desmarcamos checkbox → todas las tutorías de Química
    fireEvent.click(undefinedTutorCheckbox);
    await waitFor(() => {
      expect(screen.getAllByText(/Química/i)).toHaveLength(3);
    });
  
    // Volvemos a marcar checkbox → solo tutorías sin tutor
    fireEvent.click(undefinedTutorCheckbox);
    await waitFor(() => {
      expect(screen.getAllByText(/Química/i)).toHaveLength(1);
    });
  });

  it("no muestra tutorías si se filtra por materia o tema inexistente", async () => {
    renderWithRouter(<TutoringPage />);
  
    const searchBySelect = screen.getByLabelText(/Buscar por/i);
    const searchInput = screen.getByPlaceholderText(/Buscar por materia/i);
  
    // Filtramos por materia inexistente
    fireEvent.change(searchBySelect, { target: { value: "course" } });
    fireEvent.change(searchInput, { target: { value: "Historia" } });
  
    await waitFor(() => {
      expect(screen.getByText(/No hay tutorías disponibles/i)).toBeInTheDocument();
    });
  
    // Cambiamos a filtro por tema inexistente
    fireEvent.change(searchBySelect, { target: { value: "subject" } });
    fireEvent.change(searchInput, { target: { value: "Biología Molecular" } });
  
    await waitFor(() => {
      expect(screen.getByText(/No hay tutorías disponibles/i)).toBeInTheDocument();
    });
  });
});