import React from "react";
import { render, fireEvent, within, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route, useNavigate, useParams, Link, useLocation } from "react-router-dom";

jest.mock("../../context/UserContext", () => {
  const state = { user: null };
  const api = {
    setUser: (u) => { state.user = u; },
    logout: () => { state.user = null; },
  };
  return {
    useUser: () => ({ user: state.user, ...api }),
    __setUser: (u) => { state.user = u; },
    __getUser: () => state.user,
    __resetUser: () => { state.user = null; },
  };
});
import { useUser, __setUser, __resetUser } from "../../context/UserContext";

jest.mock("../../../features/tutorings/services/tutoringService", () => {
  const db = { tutorias: [], nextId: 1 };
  const now = () => new Date();

  const createPendingByStudent = async ({ courseId, temaId = null, studentId, availabilities }) => {
    const t = {
      id: db.nextId++,
      courseId: Number(courseId),
      temaId,
      tutorId: null,
      students: [studentId],
      capacity: null,
      scheduledAt: null,
      status: "pending",
      availabilities,
    };
    db.tutorias.push(t);
    return { ...t };
  };

  const joinAsTutor = async ({ tutoringId, tutorId, scheduledAt }) => {
    const t = db.tutorias.find((x) => x.id === Number(tutoringId));
    if (!t) throw new Error("Tutoria no encontrada");
    if (!scheduledAt) throw new Error("Debe elegir un horario");
    t.tutorId = tutorId;
    if (t.capacity == null) t.capacity = 2;
    t.scheduledAt = new Date(scheduledAt);
    t.status = "active";
    return { ...t };
  };

  const joinAsStudent = async ({ tutoringId, studentId }) => {
    const t = db.tutorias.find((x) => x.id === Number(tutoringId));
    if (!t) throw new Error("Tutoria no encontrada");
    if (t.tutorId === studentId) throw new Error("El tutor no puede unirse como estudiante");
    if (!t.students.includes(studentId)) {
      if (t.capacity != null && t.students.length >= t.capacity) throw new Error("Sin cupos");
      t.students.push(studentId);
    }
    if (t.capacity != null && t.students.length >= t.capacity) t.status = "completa";
    return { ...t };
  };

  const listAvailable = async ({ courseId, temaId = null }) => {
    const nowTs = now().getTime();
    return db.tutorias
      .filter(
        (t) =>
          t.courseId === Number(courseId) &&
          (temaId === null || t.temaId === Number(temaId)) &&
          t.status !== "finished" &&
          (t.scheduledAt == null || t.scheduledAt.getTime() >= nowTs)
      )
      .map((t) => ({ ...t, capacity: t.capacity ?? 2 }));
  };

  const getById = async (id) => {
    const t = db.tutorias.find((x) => x.id === Number(id));
    if (!t) throw new Error("Tutoria no encontrada");
    return { ...t };
  };

  const __seedFinalizada = ({ courseId, temaId = null }) => {
    if (temaId == null || Number.isNaN(Number(temaId))) {
    throw new Error("temaId requerido");
  }
    const t = {
      id: db.nextId++,
      courseId: Number(courseId),
      temaId: Number(temaId),
      tutorId: 900,
      students: [800, 801],
      capacity: 2,
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "finished",
    };
    db.tutorias.push(t);
    return { ...t };
  };

  const __resetDb = () => {
    db.tutorias = [];
    db.nextId = 1;
  };

  return {
    createPendingByStudent,
    joinAsTutor,
    joinAsStudent,
    listAvailable,
    getById,
    __seedFinalizada,
    __resetDb,
    __db: db,
  };
});

import {
  createPendingByStudent,
  joinAsTutor,
  joinAsStudent,
  listAvailable,
  __seedFinalizada,
  __resetDb,
  getById
} from "../../../features/tutorings/services/tutoringService";

function MateriaPageMock() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useUser();

  const onRecibir = async () => {
    const t = await createPendingByStudent({ courseId: Number(courseId), temaId: 10, studentId: user.id });
    navigate(`/tutoring/${t.id}`);
  };

  const onBrindar = async () => {
    const all = await listAvailable({ courseId: Number(courseId) });
    const pending = [...all].reverse().find((t) => !t.tutorId);
    if (pending) {
      const when = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await joinAsTutor({ tutoringId: pending.id, tutorId: user.id, scheduledAt: when });
      navigate("/notificaciones");
      return;
    }
    navigate(`/tutorias?course=${courseId}`);
  };

  return (
    <div>
      <h1>Materia {courseId}</h1>
      <button onClick={onRecibir}>Recibir tutoría</button>
      <button onClick={onBrindar}>Brindar tutoría</button>
      <div style={{ marginTop: 12 }}>
        <Link to={`/materias/${courseId}/temas/10`}>Ir a Tema 10</Link>
      </div>
    </div>
  );
}
function NotificacionesMock() {
  return <h2>Notificaciones</h2>;
}

function TutoriasListMock() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = Number(params.get("course"));
  const temaId = params.get("tema") ? Number(params.get("tema")) : null;

  const { user } = useUser();
  const [items, setItems] = React.useState([]);

  const reload = async () => {
    const data = await listAvailable({ courseId, temaId });
    setItems(data);
  };

  React.useEffect(() => {
    if (!Number.isFinite(courseId)) {
      setItems([]);
      return;
    }
    reload();
  }, [courseId, temaId, location.search]);

  const handleJoin = async (id) => {
    await joinAsStudent({ tutoringId: id, studentId: user.id });
    await reload();
  };

  return (
    <div>
      <h2>Tutorías disponibles</h2>
      {items.length === 0 && <p>No hay tutorías</p>}
      <ul>
        {items.map((t) => {
          const isTutor = user && t.tutorId === user.id;
          const isStudent = user && t.students.includes(user.id);
          const cupos = `${t.students.length}/${t.capacity}`;
          const llena = t.students.length >= t.capacity;
          return (
            <li
              key={t.id}
              aria-label={`tutoria-${t.id}`}
              style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}
            >
              <div>Curso: {t.courseId}</div>
              <div>Tema: {t.temaId}</div>
              <div data-testid={`tutor-${t.id}`}>
              {t.tutorId != null ? `Tutor: ${t.tutorId}` : "Tutor: Sin tutor"}</div>
              <div data-testid={`cupos-${t.id}`}>{t.tutorId ? `Cupos: ${cupos}` : "Cupos disponibles: A definir"}</div>
              <div>Estado: {t.status}</div>
              {(isTutor || isStudent) ? (
                <button aria-label={`desuscribirme-${t.id}`}>Desuscribirme</button>
              ) : (
                !llena && <button onClick={() => handleJoin(t.id)}>Unirse</button>
              )}
              {isTutor && <span data-testid={`soy-tutor-${t.id}`}>Sos el tutor</span>}
              {llena && <span data-testid={`completa-${t.id}`}>Completa</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
function TutoringShowMock() {
  const { id } = useParams();
  const [t, setT] = React.useState(null);

  React.useEffect(() => {
    getById(id).then(setT);
  }, [id]);

  if (!t) return <p>Cargando tutoría...</p>;

  const cap = t.capacity ?? 2;
  const cupos = `${t.students.length}/${cap}`;

  return (
    <div>
      <h2>Tutoría de: Administración General para Ingenieros</h2>
      <p>Modalidad: virtual</p>
      <ul>
        <li
         aria-label={`tutoria-${t.id}`}
        style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}
        >
      <div data-testid={`cupos-${t.id}`}>
        {t.tutorId ? `Cupos: ${cupos}` : "Cupos: A definir"}
      </div>
      <div data-testid={`tutor-${t.id}`}>
        {t.tutorId ? `Tutor: ${t.tutorId}` : "Tutor: Sin tutor asignado"}
      </div>
      </li>
      </ul>
      <div style={{ marginTop: 12 }}>
        <button style={{ background: "red", color: "white", border: 0, padding: 6 }}>
          Desuscribirme
        </button>
        <button style={{ marginLeft: 8 }}>Volver al listado</button>
      </div>
    </div>
  );
}

function TemaPageMock() {
  const { courseId, temaId } = useParams();
  return (
    <div>
      <h1>
        Tema {temaId} de Materia {courseId}
      </h1>
      <Link to={`/tutorias?course=${courseId}&tema=${temaId}`}>Ver tutorías del tema</Link>
    </div>
  );
}

function renderWithRouter(ui, initialPath = "/") {
  return render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}

// helpers
const awaitTutorCardIn = async (root, id) => {
  await waitFor(() =>
    expect(within(root).queryByLabelText(`tutoria-${id}`)).toBeInTheDocument()
  );
  const cards = within(root).getAllByLabelText(`tutoria-${id}`);
  return cards[cards.length - 1];
};

const expectTutorIn = (card, id, label) => {
  const el = within(card).getByTestId(`tutor-${id}`);
  expect(el).toHaveTextContent(`Tutor: ${label}`);
};

const expectCuposIn = (card, id, cuposText) => {
  const el = within(card).getByTestId(`cupos-${id}`);
  expect(el).toHaveTextContent(`Cupos: ${cuposText}`);
};

describe("Flujo de crear Tutorías", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetUser();
    __resetDb();
  });

  test("Flujo completo: Recibir→Brindar→Unirse desde Materia→Tema→Tutoría; valida cupos y tutor correcto", async () => {
    __setUser({ id: 101, name: "Estudiante A" });
    const rA = renderWithRouter(
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/materias/:courseId" element={<MateriaPageMock />} />
        <Route path="/materias/:courseId/temas/:temaId" element={<TemaPageMock />} />
        <Route path="/tutorias" element={<TutoriasListMock />} />
        <Route path="/tutoring/:id" element={<TutoringShowMock />} />
      </Routes>,
      "/materias/1"
    );

    await act(async () => {
      fireEvent.click(within(rA.container).getByRole("button", { name: /Recibir tutoría/i }));
    });
    let card = await awaitTutorCardIn(rA.container, 1);
    expectTutorIn(card, 1, "Sin tutor asignado");
    expect(within(card).getByTestId("cupos-1")).toHaveTextContent("Cupos: A definir");
    rA.unmount();

    __setUser({ id: 201, name: "Tutor B" });
    const rB = renderWithRouter(
      <Routes>
        <Route path="/materias/:courseId" element={<MateriaPageMock />} />
        <Route path="/notificaciones" element={<NotificacionesMock />} />
      </Routes>,
      "/materias/1"
    );
    await act(async () => {
      fireEvent.click(within(rB.container).getByRole("button", { name: /Brindar tutoría/i }));
    });
    await within(rB.container).findByText(/Notificaciones/i);
    rB.unmount();
    const rBList = renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
    "/tutorias?course=1"
    );
    await within(rBList.container).findByText(/Tutorías disponibles/i);
    card = await awaitTutorCardIn(rBList.container, 1);
    expectTutorIn(card, 1, "201");
    expectCuposIn(card, 1, "1/2");
    rBList.unmount();

    __setUser({ id: 301, name: "Estudiante C" });
    const rC = renderWithRouter(
      <Routes>
        <Route path="/materias/:courseId/temas/:temaId" element={<TemaPageMock />} />
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/materias/1/temas/10"
    );
    await act(async () => {
      const link = within(rC.container).getByRole("link", { name: /Ver tutorías del tema/i });
      fireEvent.click(link);
    });
    await within(rC.container).findByText(/Tutorías disponibles/i);
    card = await awaitTutorCardIn(rC.container, 1);
    expectTutorIn(card, 1, "201");
    expectCuposIn(card, 1, "1/2");

    await act(async () => {
      fireEvent.click(within(card).getByRole("button", { name: /Unirse/i }));
    });
    await within(card).findByTestId("completa-1");
    expectCuposIn(card, 1, "2/2");
    expect(within(card).getByTestId("completa-1")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /Unirse/i })).not.toBeInTheDocument();
  });

  test("Una tutoría queda completa al llenarse los cupos", async () => {
    __setUser({ id: 101, name: "A" });
    await createPendingByStudent({ courseId: 1, temaId: 10, studentId: 101 });
    await joinAsTutor({ tutoringId: 1, tutorId: 201, scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), });

    __setUser({ id: 301, name: "C" });
    const r1 = renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1&tema=10"
    );
    await within(r1.container).findByText(/Tutorías disponibles/i);
    let card = await awaitTutorCardIn(r1.container, 1);
    await act(async () => {
      fireEvent.click(within(card).getByRole("button", { name: /Unirse/i }));
    });
    await within(card).findByTestId("completa-1");
    expectCuposIn(card, 1, "2/2");
    r1.unmount();

    __setUser({ id: 302, name: "D" });
    const r2 = renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1&tema=10"
    );
    await within(r2.container).findByText(/Tutorías disponibles/i);
    card = await awaitTutorCardIn(r2.container, 1);
    expect(within(card).queryByRole("button", { name: /Unirse/i })).toBeNull();
  });

  test("Un tutor no ve el botón 'Unirse' en su propia tutoría", async () => {
    __setUser({ id: 101, name: "A" });
    await createPendingByStudent({ courseId: 1, temaId: 10, studentId: 101 });
    await joinAsTutor({ tutoringId: 1, tutorId: 201, scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), });

    __setUser({ id: 201, name: "B (tutor)" });
    const r = renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1&tema=10"
    );
    await within(r.container).findByText(/Tutorías disponibles/i);
    const card = await awaitTutorCardIn(r.container, 1);
    expect(within(card).getByTestId("soy-tutor-1")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /Unirse/i })).toBeNull();
    expect(within(card).getByRole("button", { name: /Desuscribirme/i })).toBeInTheDocument();
  });

  test("No se listan tutorías finalizadas", async () => {
    __seedFinalizada({ courseId: 1, temaId: 10 });
    __setUser({ id: 101, name: "A" });
    await createPendingByStudent({ courseId: 1, temaId: 10, studentId: 101 });
    await joinAsTutor({ tutoringId: 2, tutorId: 201, scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), });

    __setUser({ id: 301, name: "C" });
    const r = renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1&tema=10"
    );
    await within(r.container).findByText(/Tutorías disponibles/i);
    expect(within(r.container).queryByLabelText("tutoria-1")).toBeNull();
    const card = await awaitTutorCardIn(r.container, 2);
    expectTutorIn(card, 2, "201");
  });
});
