// src/features/calendar/tests/TutorSchedulePage.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import TutorSchedulePage from "../pages/TutorSchedulePage";

describe("TutorSchedulePage", () => {
  it("muestra el título con el nombre del tutor y ordena por día", () => {
    render(<TutorSchedulePage tutor={{ name: "María" }} />);

    // título
    expect(
      screen.getByRole("heading", { name: /Horarios Disponibles -\s*María/i })
    ).toBeInTheDocument();

    // orden de días 
    const dayLabels = screen
      .getAllByText(/Lunes|Miércoles|Viernes/)
      .map((n) => n.textContent);
    expect(dayLabels).toEqual(["Lunes", "Miércoles", "Viernes"]);

    expect(screen.getAllByText(/10:00/).length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText(/03:30/i)).toBeInTheDocument();
  });
});
