// src/features/tutorings/tests/TutoringFiltersPage.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TutoringFiltersPage from "../pages/PruebaPage";

// --- Mock de TutoringPage para capturar props ---
//let lastChildProps = null;
jest.mock("../pages/TutoringPage", () => ({
  __esModule: true,
  default: (props) => {
    //lastChildProps = props;
    return (
      <div
        data-testid="tutoring-page"
        data-filters={JSON.stringify(props.filters)}
        data-mode={props.mode}
      />
    );
  },
}));

// Helper para leer props del hijo desde el DOM (alternativa a usar la var global)
const getChildProps = () => {
  const el = screen.getByTestId("tutoring-page");
  return {
    filters: JSON.parse(el.getAttribute("data-filters")),
    mode: el.getAttribute("data-mode"),
  };
};

describe("TutoringFiltersPage", () => {
  test("render inicial: título y props por defecto a TutoringPage", () => {
    render(<TutoringFiltersPage />);

    // Título
    expect(
      screen.getByRole("heading", { name: /Filtrar Tutorías/i })
    ).toBeInTheDocument();

    const { filters, mode } = getChildProps();

    // Defaults del state inicial
    expect(filters).toEqual({
      enrolled: false,
      course_id: "",
      created_by_user: "",
      no_tutor: false,
      past: false,
    });
    expect(mode).toBe("serTutor");

    // El select de usuarios debe mostrar el option por defecto
    expect(
      screen.getByDisplayValue("Creadas por cualquier usuario")
    ).toBeInTheDocument();

    // El select de modo debe mostrar "Ser tutor"
    expect(screen.getByDisplayValue("Ser tutor")).toBeInTheDocument();

    // Deben estar todas las opciones de usuarios (11 + 1 por defecto)
    const userSelect = screen.getByDisplayValue("Creadas por cualquier usuario");
    expect(userSelect.querySelectorAll("option").length).toBe(12);
  });

  test("actualiza filters al togglear checkboxes", () => {
    render(<TutoringFiltersPage />);

    const enrolled = screen.getByLabelText(/Solo en las que estoy inscripto/i);
    const noTutor = screen.getByLabelText(/Sin tutor asignado/i);
    const past = screen.getByLabelText(/Mostrar las que ya pasaron/i);

    // Toggle "enrolled"
    fireEvent.click(enrolled);
    let props = getChildProps();
    expect(props.filters.enrolled).toBe(true);

    // Toggle "no_tutor"
    fireEvent.click(noTutor);
    props = getChildProps();
    expect(props.filters.no_tutor).toBe(true);

    // Toggle "past"
    fireEvent.click(past);
    props = getChildProps();
    expect(props.filters.past).toBe(true);

    // Destoggle "enrolled"
    fireEvent.click(enrolled);
    props = getChildProps();
    expect(props.filters.enrolled).toBe(false);
  });

  test("actualiza course_id cuando se escribe en el input", () => {
    render(<TutoringFiltersPage />);

    const courseInput = screen.getByPlaceholderText("Código de materia...");
    fireEvent.change(courseInput, { target: { value: "MAT101" } });

    const { filters } = getChildProps();
    expect(filters.course_id).toBe("MAT101");
  });

  test("actualiza created_by_user cuando se elige un usuario en el select", () => {
    render(<TutoringFiltersPage />);

    const userSelect = screen.getByDisplayValue("Creadas por cualquier usuario");
    // Elegimos, por ejemplo, "Luis Gómez" con value = "2"
    fireEvent.change(userSelect, { target: { value: "2" } });

    const { filters } = getChildProps();
    expect(filters.created_by_user).toBe("2");
  });

  test("actualiza mode cuando se cambia el select de modo", () => {
    render(<TutoringFiltersPage />);

    const modeSelect = screen.getByDisplayValue("Ser tutor");
    fireEvent.change(modeSelect, { target: { value: "unirme" } });
    let props = getChildProps();
    expect(props.mode).toBe("unirme");

    fireEvent.change(modeSelect, { target: { value: "misTutorias" } });
    props = getChildProps();
    expect(props.mode).toBe("misTutorias");
  });
});
