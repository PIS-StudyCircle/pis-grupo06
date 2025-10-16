import React from "react";
import { renderHook, act } from "@testing-library/react";
import { Ctx } from "@context/UserContext";
import UserProvider from "../userProvider";
import * as authApi from "../services/auth.api";
import * as storage from "@/shared/utils/storage";

jest.mock("../services/auth.api");
jest.mock("@/shared/utils/storage");

describe("UserProvider", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("signIn guarda usuario en storage y en contexto", async () => {
    const fakeUser = { id: 1, name: "Seba" };
    authApi.signIn.mockResolvedValue(fakeUser);

    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => React.useContext(Ctx), { wrapper });

    await act(async () => {
      await result.current.signIn({ email: "a@b.com", password: "123" });
    });

    expect(result.current.user).toEqual(fakeUser);
    expect(storage.saveItem).toHaveBeenCalledWith("user", fakeUser);
  });

  it("signOut limpia storage y contexto", async () => {
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => React.useContext(Ctx), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith("user");
  });

  it("hydrate carga el usuario desde la API correctamente", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, name: "Juan" } }),
    });
  
    const { result } = renderHook(() => React.useContext(Ctx), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
    });
  
    await act(async () => {}); // deja que el useEffect se ejecute
  
    expect(result.current.user).toEqual({ id: 1, name: "Juan" });
    expect(storage.saveItem).toHaveBeenCalledWith("user", { id: 1, name: "Juan" });
  });
  
  it("hydrate limpia el usuario si fetch falla", async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("falló"));
  
    const { result } = renderHook(() => React.useContext(Ctx), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
    });
  
    await act(async () => {}); // deja que el useEffect se ejecute
  
    expect(result.current.user).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith("user");
  });

  it("signIn guarda usuario cuando API responde correctamente", async () => {
    authApi.signIn.mockResolvedValueOnce({ id: 42, name: "Tester" });
  
    const { result } = renderHook(() => React.useContext(Ctx), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
    });
  
    await act(async () => {
      await result.current.signIn({ email: "a@b.com", password: "123" });
    });
  
    expect(result.current.user).toEqual({ id: 42, name: "Tester" });
    expect(storage.saveItem).toHaveBeenCalledWith("user", { id: 42, name: "Tester" });
  });

  it("signOut limpia storage y setea user en null", async () => {
    authApi.signOut.mockResolvedValueOnce();
  
    const { result } = renderHook(() => React.useContext(Ctx), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
    });
  
    await act(async () => {
      await result.current.signOut();
    });
  
    expect(storage.removeItem).toHaveBeenCalledWith("user");
    expect(result.current.user).toBeNull();
  });

  test("forgotPassword lanza error si el servidor devuelve error", async () => {
    //definimos el mock ANTES de renderHook, y lo hacemos global
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Email no encontrado" }),
    });
  
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => React.useContext(Ctx), { wrapper });
  
    //ejecutamos el método y comprobamos el error
    await expect(
      result.current.forgotPassword({ email: "a@b.com" })
    ).rejects.toThrow("Email no encontrado");
  
    // aseguramos que fetch se haya llamado correctamente
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/password"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });
  
  it("resetPassword guarda usuario y token correctamente", async () => {
    authApi.resetPassword.mockResolvedValueOnce({
      user: { data: { attributes: { id: 99, name: "ResetUser" } } },
      token: "tok123",
    });
  
    const { result } = renderHook(() => React.useContext(Ctx), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
    });
  
    await act(async () => {
      await result.current.resetPassword({ password: "123456" });
    });
  
    expect(result.current.user).toEqual({ id: 99, name: "ResetUser" });
    expect(storage.saveItem).toHaveBeenCalledWith("token", "tok123");
  });

  test("hydrate limpia usuario y storage si /users/me devuelve error HTTP", async () => {
    // Mock global de fetch para devolver error HTTP
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
  
    // Configuramos storage
    storage.getItem.mockReturnValueOnce({ id: 1, name: "Cacheado" });
    storage.removeItem.mockClear();
  
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => React.useContext(Ctx), { wrapper });
  
    // Dejamos que se ejecute el useEffect de hydrate
    await act(async () => Promise.resolve());
  
    expect(storage.removeItem).toHaveBeenCalledWith("user");
    expect(result.current.user).toBeNull();
  });
  
  test("hydrate captura excepciones y limpia usuario", async () => {
    // Mock global de fetch para lanzar excepción
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
  
    // Configuramos storage
    storage.getItem.mockReturnValueOnce({ id: 1, name: "Cacheado" });
    storage.removeItem.mockClear();
  
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => React.useContext(Ctx), { wrapper });
  
    await act(async () => Promise.resolve());
  
    expect(storage.removeItem).toHaveBeenCalledWith("user");
    expect(result.current.user).toBeNull();
  });
});