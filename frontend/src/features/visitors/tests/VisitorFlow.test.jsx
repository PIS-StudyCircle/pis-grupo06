import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import VisitorFlow from "../pages/VisitorFlow";

import * as Router from "react-router-dom";
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: jest.fn() };
});

describe("VisitorFlow", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Router.useNavigate.mockReturnValue(mockNavigate);
  });

  it("renderiza títulos, descripciones y botones", () => {
    render(<VisitorFlow />);

    expect(
      screen.getByRole("heading", { name: "¡Hola!", level: 1 })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Nos alegra que estés acá/i, level: 2 })
    ).toBeInTheDocument();

    // Descripciones visibles (texto)
    expect(
      screen.getByText(/Study Circle es una aplicación pensada para estudiantes/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Podés crear o unirte a tutorías, elegir tus materias de interés/i)
    ).toBeInTheDocument();

    // Botones visibles
    expect(screen.getByRole("button", { name: /Registrarse/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it("navega a /registrarse al hacer click en 'Registrarse'", () => {
    render(<VisitorFlow />);

    fireEvent.click(screen.getByRole("button", { name: /Registrarse/i }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/registrarse");
  });

  it("navega a /iniciar_sesion al hacer click en 'Iniciar sesión'", () => {
    render(<VisitorFlow />);

    fireEvent.click(screen.getByRole("button", { name: /Iniciar sesión/i }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/iniciar_sesion");
  });
});
