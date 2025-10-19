import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../../../shared/components/layout/NavBar";
import { NotificationsCtx } from "../../../shared/context/NotificationContext";
import { useUser } from "../../../shared/context/UserContext";

// jest.mock("@rails/actioncable", () => ({
//   createConsumer: jest.fn(() => ({
//     subscriptions: { create: jest.fn(() => ({ unsubscribe: jest.fn() })) },
//     disconnect: jest.fn(),
//   })),
// }));

jest.mock("../components/Bell", () => {
  const React = jest.requireActual("react");
  const { NotificationsCtx: RealNotificationsCtx } = jest.requireActual("../../../shared/context/NotificationContext");

  function MockBell() {
    const ctx = React.useContext(RealNotificationsCtx) || { list: [], unread: 0, unseen: 0 };
    const markAllSeenFn = ctx && ctx.markAllSeen ? ctx.markAllSeen : undefined;
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      if (!open) return;
      (async () => {
        try {
          if (typeof markAllSeenFn === "function") await markAllSeenFn();
        } catch (e) {
          console.error("markAllSeen failed", e);
        }
      })();
    }, [open, markAllSeenFn]);

    async function safeMarkRead(id) {
      try {
        if (ctx.markRead) await ctx.markRead(id);
      } catch (e) {
        console.error("markRead failed", e);
      }
    }

    async function safeDeleteOne(id) {
      try {
        if (ctx.deleteOne) await ctx.deleteOne(id);
      } catch (e) {
        console.error("deleteOne failed", e);
      }
    }

    async function safeMarkAllRead() {
      try {
        if (ctx.markAllRead) await ctx.markAllRead();
      } catch (e) {
        console.error("markAllRead failed", e);
      }
    }

    async function safeDeleteAll() {
      try {
        if (ctx.deleteAll) await ctx.deleteAll();
      } catch (e) {
        console.error("deleteAll failed", e);
      }
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "button",
        {
          title: ctx.unread > 0 ? `${ctx.unread} notificaciones sin leer` : "Notificaciones",
          onClick: () => setOpen((v) => !v),
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
                "div",
                null,
                React.createElement(
                  "div",
                  null,
                  ctx.list.length > 0 &&
                    React.createElement("button", { onClick: safeDeleteAll }, "Eliminar todas"),
                  ctx.unread > 0 &&
                    React.createElement("button", { onClick: safeMarkAllRead }, "Marcar todas como leídas")
                ),
                React.createElement(
                  "ul",
                  null,
                  ctx.list.map((n) =>
                    React.createElement(
                      "li",
                      {
                        key: n.id,
                        "data-id": n.id,
                        "data-read": n.read_at ? "true" : "false",
                        "data-read-ts": n.read_at || "",
                        "data-seen": n.seen_at ? "true" : "false",
                        "data-seen-ts": n.seen_at || "",
                      },
                      React.createElement("button", { type: "button", onClick: () => safeMarkRead(n.id) }, n.title),
                      React.createElement(
                        "button",
                        { "aria-label": "Eliminar notificación", onClick: () => safeDeleteOne(n.id) },
                        "X"
                      )
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

// NavBar y NotificationsCtx se importan arriba; useUser vendrá del mock hoisted por Jest
// NavBar se importa para renderizar la UI con el Bell mockeado

//NavBar envuelto en un provider para simular efectos reales
function renderProvider(initial = [], overrides = {}) {
  const spies = {
    markRead: overrides.markRead ?? jest.fn(async (id) => { void id; }),
    deleteOne: overrides.deleteOne ?? jest.fn(async (id) => { void id; }),
    markAllRead: overrides.markAllRead ?? jest.fn(async () => {}),
    deleteAll: overrides.deleteAll ?? jest.fn(async () => {}),
    markAllSeen: overrides.markAllSeen ?? jest.fn(async () => {}),
  };

  function TestProvider({ children }) {
    const [list, setList] = React.useState(initial);

    const markRead = async (id) => {
      try {
        await spies.markRead(id);
        setList((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      } catch (e) {
        console.error("markRead failed", e);
      }
    };

    const deleteOne = async (id) => {
      try {
        await spies.deleteOne(id);
        setList((prev) => prev.filter((n) => n.id !== id));
      } catch (e) {
        console.error("deleteOne failed", e);
      }
    };

    const markAllRead = async () => {
      try {
        await spies.markAllRead();
        const now = new Date().toISOString();
        setList((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
      } catch (e) {
        console.error("markAllRead failed", e);
      }
    };

    const deleteAll = async () => {
      try {
        await spies.deleteAll();
        setList([]);
      } catch (e) {
        console.error("deleteAll failed", e);
      }
    };

    const markAllSeen = async () => {
      try {
        await spies.markAllSeen();
        const now = new Date().toISOString();
        setList((prev) => prev.map((n) => (n.seen_at ? n : { ...n, seen_at: now })));
      } catch (e) {
        console.error("markAllSeen failed", e);
      }
    };

    const unread = list.filter((n) => !n.read_at).length;
    const unseen = list.filter((n) => !n.seen_at).length;
    const value = { list, unread, unseen, markRead, markAllRead, markAllSeen, deleteOne, deleteAll };

    return React.createElement(NotificationsCtx.Provider, { value }, children);
  }

  const utils = render(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(TestProvider, null, React.createElement(NavBar, null))
    )
  );

  return { ...utils, spies };
}

describe("Notification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUser.mockReturnValue({ user: { id: 1, name: "Usuario" }, signOut: jest.fn() });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("No muestra campana si no hay usuario logueado", () => {
    useUser.mockReturnValue({ user: null });
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.queryByTitle(/Notificaciones/i)).not.toBeInTheDocument();
  });

  it("Si hay usuario y lista vacía muestra placeholder y no acciones", async () => {
    renderProvider([]);
    const bells = await screen.findAllByTitle(/Notificaciones/i);
    fireEvent.click(bells[0]);
    expect(await screen.findByText(/No hay notificaciones/i)).toBeInTheDocument();
    expect(screen.queryByText(/Eliminar todas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Marcar todas como leídas/i)).not.toBeInTheDocument();
  });

  it("Toggle Bell", async () => {
    renderProvider([]);
    const bells = await screen.findAllByTitle(/Notificaciones/i);
    fireEvent.click(bells[0]);
    expect(await screen.findByText(/No hay notificaciones/i)).toBeInTheDocument();
    fireEvent.click(bells[0]);
    await waitFor(() => expect(screen.queryByText(/No hay notificaciones/i)).not.toBeInTheDocument());
  });

  it("markRead", async () => {
    const initial = [{ id: 1, title: "Notificación 1", created_at: new Date().toISOString(), read_at: null, seen_at: null }];

    const { spies } = renderProvider(initial);

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);

    const itemBtn = await screen.findByText("Notificación 1");
    fireEvent.click(itemBtn);
    await waitFor(() => expect(spies.markRead).toHaveBeenCalledWith(1));

    const li = itemBtn.closest("li");
    expect(li).toHaveAttribute("data-read", "true");
    expect(li.getAttribute("data-read-ts")).not.toBe("");
    const bellsAfter = await screen.findAllByTitle(/Notificaciones/i);
    expect(bellsAfter[0].getAttribute("title")).not.toMatch(/notificaciones sin leer/i);
  });

  it("deleteOne", async () => {
    const initial = [
      { id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null },
      { id: 2, title: "N2", created_at: new Date().toISOString(), read_at: null, seen_at: null },
      { id: 3, title: "N3", created_at: new Date().toISOString(), read_at: null, seen_at: null },
    ];

    const { spies } = renderProvider(initial);

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[1];
    fireEvent.click(bell);

    const delButtons = await screen.findAllByRole("button", { name: /Eliminar notificación/i });
    expect(delButtons.length).toBeGreaterThan(0);
    fireEvent.click(delButtons[1]);

    await waitFor(() => expect(spies.deleteOne).toHaveBeenCalledWith(2));
    await waitFor(() => expect(screen.queryByText("N2")).not.toBeInTheDocument());
    expect(screen.getByText("N1")).toBeInTheDocument();
    expect(screen.getByText("N3")).toBeInTheDocument();
  });

  it("markAllRead", async () => {
    const initial = [
      { id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null },
      { id: 2, title: "N2", created_at: new Date().toISOString(), read_at: null, seen_at: null },
    ];
    const { spies } = renderProvider(initial);

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    expect(bell.getAttribute("title")).toMatch(/notificaciones sin leer/i);

    fireEvent.click(bell);
    const markAllBtn = await screen.findByText(/Marcar todas como leídas/i);
    fireEvent.click(markAllBtn);

    await waitFor(() => expect(spies.markAllRead).toHaveBeenCalled());

    const items = screen.getAllByRole("listitem");
    items.forEach((li) => {
      expect(li).toHaveAttribute("data-read", "true");
      expect(li.getAttribute("data-read-ts")).not.toBe("");
    });

    const bellsAfter = await screen.findAllByTitle(/Notificaciones/i);
    expect(bellsAfter[0].getAttribute("title")).not.toMatch(/notificaciones sin leer/i);
  });

  it("deleteAll", async () => {
    const initial = [
      { id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null },
      { id: 2, title: "N2", created_at: new Date().toISOString(), read_at: null, seen_at: null },
    ];

    const { spies } = renderProvider(initial);

    jest.spyOn(globalThis, "confirm").mockReturnValue(true);

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);

    const deleteAllBtn = await screen.findByText(/Eliminar todas/i);
    fireEvent.click(deleteAllBtn);
    await waitFor(() => expect(spies.deleteAll).toHaveBeenCalled());

    expect(await screen.findByText(/No hay notificaciones/i)).toBeInTheDocument();
    globalThis.confirm.mockRestore();
  });

  it("markAllSeen", async () => {
    const seenTs = "2020-01-01T00:00:00.000Z";
    const initial = [
      { id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: seenTs },
      { id: 2, title: "N2", created_at: new Date().toISOString(), read_at: null, seen_at: null },
    ];

    const { spies } = renderProvider(initial);

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);

    await waitFor(() => expect(spies.markAllSeen).toHaveBeenCalled());

    const items = screen.getAllByRole("listitem");
    const li1 = items.find(li => li.getAttribute("data-id") === "1");
    const li2 = items.find(li => li.getAttribute("data-id") === "2");

    expect(li1.getAttribute("data-seen-ts")).toBe(seenTs);
    expect(li2.getAttribute("data-seen-ts")).not.toBe("");

    const bellsAfter = await screen.findAllByTitle(/Notificaciones/i);
    expect(bellsAfter[0].getAttribute("title")).toMatch(/2 notificaciones sin leer/i);
  });

  it("markRead falla", async () => {
    const initial = [{ id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null }];
    const failingMarkRead = jest.fn(async () => {
      throw new Error("backend markRead fail");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { spies } = renderProvider(initial, { markRead: failingMarkRead });

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);
    fireEvent.click(await screen.findByText("N1"));

    await waitFor(() => expect(spies.markRead).toHaveBeenCalledWith(1));
    expect(consoleSpy).toHaveBeenCalled();
    const li = screen.getByText("N1").closest("li");
    expect(li).toHaveAttribute("data-read", "false");
    expect(li.getAttribute("data-read-ts")).toBe("");
  });

  it("deleteOne falla", async () => {
    const initial = [{ id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null }];
    const failingDeleteOne = jest.fn(async () => {
      throw new Error("backend deleteOne fail");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { spies } = renderProvider(initial, { deleteOne: failingDeleteOne });

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);

    const delButton = await screen.findByRole("button", { name: /Eliminar notificación/i });
    fireEvent.click(delButton);

    await waitFor(() => expect(spies.deleteOne).toHaveBeenCalledWith(1));
    expect(consoleSpy).toHaveBeenCalled();
    expect(screen.getByText("N1")).toBeInTheDocument();
  });

  it("markAllRead falla", async () => {
    const initial = [{ id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null }];
    const failingMarkAllRead = jest.fn(async () => {
      throw new Error("backend markAllRead fail");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { spies } = renderProvider(initial, { markAllRead: failingMarkAllRead });

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);

    const markAllBtn = await screen.findByText(/Marcar todas como leídas/i);
    fireEvent.click(markAllBtn);

    await waitFor(() => expect(spies.markAllRead).toHaveBeenCalled());
    expect(consoleSpy).toHaveBeenCalled();
    const li = screen.getByText("N1").closest("li");
    expect(li).toHaveAttribute("data-read", "false");
    expect(li.getAttribute("data-read-ts")).toBe("");
  });

  it("deleteAll falla", async () => {
    const initial = [{ id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null }];
    const failingDeleteAll = jest.fn(async () => {
      throw new Error("backend deleteAll fail");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(globalThis, "confirm").mockReturnValue(true);

    const { spies } = renderProvider(initial, { deleteAll: failingDeleteAll });

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);

    const deleteAllBtn = await screen.findByText(/Eliminar todas/i);
    fireEvent.click(deleteAllBtn);

    await waitFor(() => expect(spies.deleteAll).toHaveBeenCalled());
    expect(consoleSpy).toHaveBeenCalled();
    expect(screen.getByText("N1")).toBeInTheDocument();
    globalThis.confirm.mockRestore();
  });

  it("markAllSeen falla", async () => {
    const initial = [{ id: 1, title: "N1", created_at: new Date().toISOString(), read_at: null, seen_at: null }];
    const failingMarkAllSeen = jest.fn(async () => {
      throw new Error("backend markAllSeen fail");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { spies } = renderProvider(initial, { markAllSeen: failingMarkAllSeen });

    const bell = (await screen.findAllByTitle(/Notificaciones/i))[0];
    fireEvent.click(bell);

    await waitFor(() => expect(spies.markAllSeen).toHaveBeenCalled());
    expect(consoleSpy).toHaveBeenCalled();
    const li = screen.getByText("N1").closest("li");
    expect(li).toHaveAttribute("data-seen", "false");
    expect(li.getAttribute("data-seen-ts")).toBe("");
  });
});