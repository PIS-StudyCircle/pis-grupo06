import React from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../../../shared/components/layout/NavBar";
import { NotificationsCtx } from "../../../shared/context/NotificationContext";
import { useUser } from "../../../shared/context/UserContext";

jest.mock("../components/Bell", () => {
  const React = jest.requireActual("react");
  const { NotificationsCtx: RealNotificationsCtx } = jest.requireActual("../../../shared/context/NotificationContext");

  function MockBell() {
    const ctx = React.useContext(RealNotificationsCtx) || { list: [], unread: 0, unseen: 0 };
    const [open, setOpen] = React.useState(false);
    const toggle = () => setOpen((v) => !v);

    function navigateTo(url) {
      if (typeof globalThis.__navigate__ === "function") {
        return globalThis.__navigate__(url);
      }
      if (globalThis.location && typeof globalThis.location.assign === "function") {
        return globalThis.location.assign(url);
      }
      globalThis.location.href = url;
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "button",
        {
          title: ctx.unread > 0 ? `${ctx.unread} notificaciones sin leer` : "Notificaciones",
          onClick: toggle,
          "data-testid": "mock-bell-button"
        },
        "🔔"
      ),
      open &&
        React.createElement(
          "div",
          { role: "menu" },
          ctx.list.length === 0
            ? React.createElement("div", null, "No hay notificaciones")
            : React.createElement(
                "ul",
                null,
                ctx.list.map((n) =>
                  React.createElement(
                    "li",
                    {
                      key: n.id,
                      "data-id": n.id,
                      "data-read": n.read_at ? "true" : "false",
                      "data-seen": n.seen_at ? "true" : "false",
                      "data-url": n.url || ""
                    },
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            if (n.url) navigateTo(n.url);
                          }
                        },
                        n.title
                      ),
                      n.url && React.createElement("span", { "data-testid": `notif-url-${n.id}`, style: { marginLeft: 8 } }, n.url)
                    )
                  )
                )
              )
        )
    );
  }

  return { Bell: MockBell };
});

jest.mock("../../../shared/context/UserContext", () => ({ useUser: jest.fn() }));

function renderProvider(initial = [], overrides = {}) {
  const spies = {
    pushNotificationSpy: overrides.pushNotification ?? jest.fn(async () => {}),
  };

  let pushFn = null;

  function TestProvider({ children }) {
    const [list, setList] = React.useState(initial);

    const pushNotification = async (notif) => {
      await spies.pushNotificationSpy(notif);
      setList((prev) => [notif, ...prev]);
    };

    pushFn = pushNotification;

    const unread = list.filter((n) => !n.read_at).length;
    const unseen = list.filter((n) => !n.seen_at).length;
    const value = { list, unread, unseen, pushNotification };

    return React.createElement(NotificationsCtx.Provider, { value }, children);
  }

  const utils = render(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(TestProvider, null, React.createElement(NavBar, null))
    )
  );

  return { ...utils, spies, notify: async (n) => pushFn && pushFn(n) };
}

const TUTOR = { id: 1, name: "Tutor" };
const STUDENT1 = { id: 2, name: "Student1" };
const STUDENT2 = { id: 3, name: "Student2" };
const COURSE = { id: 1, name: "Álgebra" };

function backendNotif(event, params = {}) {
  const courseName = params.courseName ?? "Álgebra";
  const actor = params.actor ?? "Usuario";
  switch (event) {
    case "join_tutoring":
      return { id: params.id ?? "join1", title: `${actor} se unió a tu tutoría de ${courseName}`, url: '/notificaciones', created_at: new Date().toISOString() };
    case "unsubscribe":
      return { id: params.id ?? "unsub1", title: `${actor} se dio de baja de tu tutoría de ${courseName}`, url: '/notificaciones', created_at: new Date().toISOString() };
    case "tutoring_cancelled":
      return { id: params.id ?? "cancel1", title: `Tutoría cancelada: ${courseName}`, url: '/notificaciones', created_at: new Date().toISOString() };
    case "confirm_by_tutor":
      return { id: params.id ?? "conf1", title: `Tu solicitud de tutoría de ${courseName} fue confirmada`, url: '/notificaciones', created_at: new Date().toISOString() };
    case "confirm_by_student":
      return { id: params.id ?? "conf2", title: `El estudiante ${actor} confirmó la tutoría de ${courseName}`, url: '/notificaciones', created_at: new Date().toISOString() };
    case "new_tutoring":
      return { id: params.id ?? "new1", title: `Se creó una nueva tutoría de ${courseName}`, url: `/tutorias/materia/${COURSE.id}`, created_at: new Date().toISOString() };
    case "review":
      return { id: params.id ?? "rev1", title: `Nueva reseña recibida`, url: `/usuarios/${TUTOR.id}/reviews`, created_at: new Date().toISOString() };
    case "feedback":
      return { id: params.id ?? "fb1", title: `Tu tutoría de ${courseName} finalizó. ¡Deja tu feedback!`, url: `/tutorias/${params.tutoringId}/feedbacks`, created_at: new Date().toISOString() };
    case "reminder":
      return { id: params.id ?? "rem1", title: `Recordatorio: tu tutoría de ${courseName}`, url: '/notificaciones', created_at: new Date().toISOString() };
    default:
      return { id: params.id ?? "x", title: params.title ?? "Notificación", url: params.url ?? "/notificaciones", created_at: new Date().toISOString() };
  }
}

describe("Notification", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    useUser.mockReturnValue({ user: null, signOut: jest.fn() });
  });

  afterEach(() => {
    cleanup();
    delete globalThis.__navigate__;
  });

  it("join_tutoring -> notifica al tutor y navega a la url", async () => {
    useUser.mockReturnValue({ user: TUTOR, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("join_tutoring", { actor: STUDENT2.name, tutoringId: 42 });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent("/notificaciones");

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(`${STUDENT2.name} se unió a tu tutoría de Álgebra`);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith("/notificaciones");
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("unsubscribe -> notifica al tutor y navega a la url", async () => {
    useUser.mockReturnValue({ user: TUTOR, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("unsubscribe", { actor: STUDENT1.name, tutoringId: 55 });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    // la url debe mostrarse en el dropdown
    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent("/notificaciones");

    // simular navegación y verificar llamada
    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(`${STUDENT1.name} se dio de baja de tu tutoría de Álgebra`);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith("/notificaciones");
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("tutoring_cancelled -> notifica a inscritos y navega a la url", async () => {
    useUser.mockReturnValue({ user: STUDENT1, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("tutoring_cancelled", { tutoringId: 66 });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent(notif.url);

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      // título genérico "Tutoría cancelada" puede variar; buscamos parte del texto
      const item = await screen.findByText(/Tutoría cancelada/i);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith(notif.url);
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("confirm_schedule por tutor -> notifica al creador y navega", async () => {
    useUser.mockReturnValue({ user: STUDENT1, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("confirm_by_tutor", { tutoringId: 10 });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent(`/notificaciones`);

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(/Tu solicitud de tutoría de Álgebra fue confirmada/i);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith(`/notificaciones`);
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("confirm_schedule por student -> notifica al tutor y navega", async () => {
    useUser.mockReturnValue({ user: TUTOR, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("confirm_by_student", { actor: STUDENT1.name, tutoringId: 11 });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent("/notificaciones");

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(`El estudiante ${STUDENT1.name} confirmó la tutoría de Álgebra`);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith("/notificaciones");
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("nueva tutoría -> notifica a favoriters y navega", async () => {
    useUser.mockReturnValue({ user: STUDENT2, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("new_tutoring", { courseId: COURSE.id });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent(`/tutorias/materia/${COURSE.id}`);

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(/Se creó una nueva tutoría de Álgebra/i);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith(`/tutorias/materia/${COURSE.id}`);
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("review -> notifica al tutor y navega al listado de reseñas", async () => {
    useUser.mockReturnValue({ user: TUTOR, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("review", { reviewed_id: TUTOR.id });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent(`/usuarios/${TUTOR.id}/reviews`);

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(/Nueva reseña recibida/i);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith(`/usuarios/${TUTOR.id}/reviews`);
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("tutoría finalizada -> notifica a participantes para feedback y navega", async () => {
    useUser.mockReturnValue({ user: STUDENT1, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("feedback", { tutoringId: 99 });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent("/tutorias/99/feedbacks");

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(/Tu tutoría de Álgebra finalizó/i);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith("/tutorias/99/feedbacks");
    } finally {
      delete globalThis.__navigate__;
    }
  });

  it("recordatorio 24h -> notifica a tutor y estudiantes y navega", async () => {
    useUser.mockReturnValue({ user: STUDENT2, signOut: jest.fn() });

    const { notify } = renderProvider([]);
    const notif = backendNotif("reminder", { tutoringId: 77 });

    await act(async () => { await notify(notif); });

    const bells = await screen.findAllByTestId("mock-bell-button");
    fireEvent.click(bells[0]);

    expect(await screen.findByTestId(`notif-url-${notif.id}`)).toHaveTextContent("/notificaciones");

    const assignSpy = jest.fn();
    globalThis.__navigate__ = assignSpy;
    try {
      const item = await screen.findByText(/Recordatorio: tu tutoría de Álgebra/i);
      fireEvent.click(item);
      expect(assignSpy).toHaveBeenCalledWith("/notificaciones");
    } finally {
      delete globalThis.__navigate__;
    }
  });
});