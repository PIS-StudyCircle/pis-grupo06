import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import HelpMenu from "../components/HelpMenu";

describe("<HelpMenu />", () => {
  const renderWithRoute = (route = "/") => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <HelpMenu />
      </MemoryRouter>
    );
  };

  function Wrapper() {
    const navigate = useNavigate();
    return (
      <div>
        <button onClick={() => navigate("/usuarios")}>Ir a usuarios</button>
        <HelpMenu />
      </div>
    );
  }

  test("muestra el botón de ayuda", () => {
    renderWithRoute();
    expect(screen.getByTitle("Ayuda")).toBeInTheDocument();
  });

  test("abre y cierra el menú de ayuda al hacer clic", () => {
    renderWithRoute();

    const helpButton = screen.getByTitle("Ayuda");
    fireEvent.click(helpButton);

    expect(screen.getByText(/guía rápida/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cerrar/i));
    expect(screen.queryByText(/guía rápida/i)).not.toBeInTheDocument();
  });

  test("muestra el texto de ayuda correcto para la ruta /materias", () => {
    renderWithRoute("/materias");

    // abrir menú
    fireEvent.click(screen.getByTitle("Ayuda"));

    expect(
      screen.getByText(/Bienvenido a Study Circle/i)
    ).toBeInTheDocument();
  });

  test("cambia entre pasos al presionar 'Siguiente' y 'Anterior'", () => {
    renderWithRoute("/materias");

    // abrir menú
    fireEvent.click(screen.getByTitle("Ayuda"));

    // debería mostrar el primer texto
    expect(screen.getByText(/Bienvenido a Study Circle/i)).toBeInTheDocument();

    // avanzar
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    fireEvent.click(nextButton);

    // el texto cambia
    expect(
      screen.getByText(/explorar todas las materias/i)
    ).toBeInTheDocument();

    // retroceder
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    fireEvent.click(prevButton);

    expect(screen.getByText(/Bienvenido a Study Circle/i)).toBeInTheDocument();
  });

  test("reinicia el índice de ayuda cuando cambia la ruta", () => {
    render(
      <MemoryRouter initialEntries={["/materias"]}>
        <Routes>
          <Route path="*" element={<Wrapper />} />
        </Routes>
      </MemoryRouter>
    );
  
    // abrir menú
    fireEvent.click(screen.getByTitle("Ayuda"));
  
    // avanzar al segundo texto
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(
      screen.getByText(/explorar todas las materias/i)
    ).toBeInTheDocument();
  
    // cambiar ruta a /usuarios
    fireEvent.click(screen.getByText("Ir a usuarios"));
  
    // ahora debe mostrar el texto de la ruta /usuarios
    expect(
      screen.getByText(/ver todos los usuarios/i)
    ).toBeInTheDocument();
  });
});