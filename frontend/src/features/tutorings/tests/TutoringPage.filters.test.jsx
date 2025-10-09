import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter, mockUseTutorings } from "./TutoringPage.testUtils";
import TutoringPage from "../pages/TutoringPage";

describe("TutoringPage - Filtros y búsqueda", () => {
  beforeEach(() => {
    mockUseTutorings();
  });

  it("filtra por materia correctamente", async () => {
    renderWithRouter(<TutoringPage />);

    const searchInput = screen.getByPlaceholderText(/Buscar por materia/i);
    fireEvent.change(searchInput, { target: { value: "Física" } });

    expect(await screen.findByText("Física")).toBeInTheDocument();
  });

  it("filtra por tema correctamente", async () => {
    renderWithRouter(<TutoringPage />);

    const searchBySelect = screen.getByLabelText(/Buscar por/i);
    fireEvent.change(searchBySelect, { target: { value: "subject" } });

    const searchInput = screen.getByPlaceholderText(/Buscar por tema/i);
    fireEvent.change(searchInput, { target: { value: "Tema 1" } });

    expect(await screen.findByText("Álgebra")).toBeInTheDocument();
  });
});