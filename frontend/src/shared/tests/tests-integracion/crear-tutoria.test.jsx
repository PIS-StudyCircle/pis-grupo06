import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

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
import { __setUser, __resetUser } from "../../context/UserContext";

jest.mock("../../../features/tutorings/services/tutoringService", () => {
  const db = { tutorias: [], nextId: 1 };
  const now = () => new Date();

  const createPendingByStudent = async ({ courseId, topicId = null, studentId, capacity = 2 }) => {
    const t = {
      id: db.nextId++,
      courseId: Number(courseId),
      topicId,
      tutorId: null,
      students: [studentId],
      capacity,
      scheduledAt: new Date(now().getTime() + 60 * 60 * 1000),
      status: "pendiente",
    };
    db.tutorias.push(t);
    return { ...t };
  };

  const joinAsTutor = async ({ tutoringId, tutorId }) => {
    const t = db.tutorias.find((x) => x.id === Number(tutoringId));
    if (!t) throw new Error("Tutoria no encontrada");
    t.tutorId = tutorId;
    if (t.students.length > 0) t.status = "activa";
    return { ...t };
  };

  const joinAsStudent = async ({ tutoringId, studentId }) => {
    const t = db.tutorias.find((x) => x.id === Number(tutoringId));
    if (!t) throw new Error("Tutoria no encontrada");
    if (t.tutorId === studentId) throw new Error("El tutor no puede unirse como estudiante");
    if (!t.students.includes(studentId)) {
      if (t.students.length >= t.capacity) throw new Error("Sin cupos");
      t.students.push(studentId);
    }
    if (t.students.length >= t.capacity) t.status = "completa";
    return { ...t };
  };

  const listAvailable = async ({ courseId, topicId = null }) => {
    const nowTs = now().getTime();
    return db.tutorias
      .filter(
        (t) =>
          t.courseId === Number(courseId) &&
          (topicId === null || t.topicId === Number(topicId)) &&
          t.status !== "finalizada" &&
          t.scheduledAt.getTime() >= nowTs
      )
      .map((t) => ({ ...t }));
  };

  const getById = async (id) => {
    const t = db.tutorias.find((x) => x.id === Number(id));
    if (!t) throw new Error("Tutoria no encontrada");
    return { ...t };
  };

  const __seedFinalizada = ({ courseId, topicId = null }) => {
    const t = {
      id: db.nextId++,
      courseId: Number(courseId),
      topicId: topicId === null ? null : Number(topicId),
      tutorId: 900,
      students: [800, 801],
      capacity: 2,
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "finalizada",
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
  getById,
  __seedFinalizada,
  __resetDb,
} from "../../../features/tutorings/services/tutoringService";

function MateriaPageMock() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = require("../../context/UserContext").useUser();

  const onRecibir = async () => {
    await createPendingByStudent({ courseId: Number(courseId), studentId: user.id, capacity: 2 });
    navigate(`/tutorias?course=${courseId}`);
  };

  const onBrindar = async () => {
    const all = await listAvailable({ courseId: Number(courseId) });
    const pendiente = [...all].reverse().find((t) => !t.tutorId);
    if (pendiente) {
      await joinAsTutor({ tutoringId: pendiente.id, tutorId: user.id });
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

function TutoriasListMock() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = Number(params.get("course"));
  const topicId = params.get("topic") ? Number(params.get("topic")) : null;

  const { user } = require("../../context/UserContext").useUser();
  const [items, setItems] = React.useState([]);

  const reload = async () => {
    const data = await listAvailable({ courseId, topicId });
    setItems(data);
  };

  React.useEffect(() => {
    if (!Number.isFinite(courseId)) {
      setItems([]);
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, topicId, location.search]);

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
          const cupos = `${t.students.length}/${t.capacity}`;
          const llena = t.students.length >= t.capacity;
          return (
            <li
              key={t.id}
              aria-label={`tutoria-${t.id}`}
              style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}
            >
              <div>Curso: {t.courseId}</div>
              <div>Tema: {t.topicId ?? "-"}</div>
              <div data-testid={`tutor-${t.id}`}>Tutor: {t.tutorId ?? "Sin tutor"}</div>
              <div data-testid={`cupos-${t.id}`}>Cupos: {cupos}</div>
              <div>Estado: {t.status}</div>
              {!isTutor && !llena && (
                <button onClick={() => handleJoin(t.id)}>Unirse</button>
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

function TemaPageMock() {
  const { courseId, topicId } = useParams();
  return (
    <div>
      <h1>
        Tema {topicId} de Materia {courseId}
      </h1>
      <Link to={`/tutorias?course=${courseId}&topic=${topicId}`}>Ver tutorías del tema</Link>
    </div>
  );
}

function renderWithRouter(ui, initialPath = "/") {
  return render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}

const awaitTutorCard = async (id) => {
  await screen.findByLabelText(`tutoria-${id}`);
};

const expectTutor = async (id, tutorLabel) => {
  const nodes = await screen.findAllByTestId(`tutor-${id}`);
  const last = nodes[nodes.length - 1];
  expect(last).toHaveTextContent(`Tutor: ${tutorLabel}`);
};

const expectCupos = async (id, cuposText) => {
  const nodes = await screen.findAllByTestId(`cupos-${id}`);
  const last = nodes[nodes.length - 1];
  expect(last).toHaveTextContent(`Cupos: ${cuposText}`);
};

const clickLinkByText = (text) => {
  fireEvent.click(screen.getByRole("link", { name: new RegExp(text, "i") }));
};

describe("Flujo de crear Tutorías", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetUser();
    __resetDb();
  });

  test("Flujo completo: Recibir→Brindar→Unirse desde Materia→Tema→Tutoría; valida cupos y tutor correcto", async () => {
  const awaitTutorCard = async (root, id) => {
    const cards = await within(root).findAllByLabelText(`tutoria-${id}`);
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

  // 1) A crea pendiente desde Materia
  __setUser({ id: 101, name: "Estudiante A" });
  const rA = renderWithRouter(
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/materias/:courseId" element={<MateriaPageMock />} />
      <Route path="/materias/:courseId/temas/:topicId" element={<TemaPageMock />} />
      <Route path="/tutorias" element={<TutoriasListMock />} />
    </Routes>,
    "/materias/1"
  );

  fireEvent.click(within(rA.container).getByRole("button", { name: /Recibir tutoría/i }));
  let card = await awaitTutorCard(rA.container, 1);
  expectTutorIn(card, 1, "Sin tutor");
  expectCuposIn(card, 1, "1/2");

  // 2) B se ofrece como tutor desde Materia
  __setUser({ id: 201, name: "Tutor B" });
  const rB = renderWithRouter(
    <Routes>
      <Route path="/materias/:courseId" element={<MateriaPageMock />} />
      <Route path="/tutorias" element={<TutoriasListMock />} />
    </Routes>,
    "/materias/1"
  );

  fireEvent.click(within(rB.container).getByRole("button", { name: /Brindar tutoría/i }));
  card = await awaitTutorCard(rB.container, 1);
  expectTutorIn(card, 1, "201");
  expectCuposIn(card, 1, "1/2");

  const t1 = await getById(1);
  __resetDb();
  await createPendingByStudent({ courseId: t1.courseId, topicId: 10, studentId: 101, capacity: 2 });
  await joinAsTutor({ tutoringId: 1, tutorId: 201 });

  // 3) C entra por Materia y se une a la tutoría
  __setUser({ id: 301, name: "Estudiante C" });
  const rC = renderWithRouter(
    <Routes>
      <Route path="/materias/:courseId/temas/:topicId" element={<TemaPageMock />} />
      <Route path="/tutorias" element={<TutoriasListMock />} />
    </Routes>,
    "/materias/1/temas/10"
  );

  // Navega al listado de tutorías del tema
  const link = within(rC.container).getByRole("link", { name: /Ver tutorías del tema/i });
  fireEvent.click(link);

  card = await awaitTutorCard(rC.container, 1);
  expectTutorIn(card, 1, "201");
  expectCuposIn(card, 1, "1/2");

  // C se une y queda completa la tutoría
  fireEvent.click(within(card).getByRole("button", { name: /Unirse/i }));
  await within(card).findByTestId("completa-1");
  expectCuposIn(card, 1, "2/2");
  expect(within(card).getByTestId("completa-1")).toBeInTheDocument();
  expect(within(card).queryByRole("button", { name: /Unirse/i })).not.toBeInTheDocument();
});


  test("Una tutoría queda completa al llenarse los cupos", async () => {
    __setUser({ id: 101, name: "A" });
    await createPendingByStudent({ courseId: 1, studentId: 101, capacity: 2 });
    await joinAsTutor({ tutoringId: 1, tutorId: 201 });

    __setUser({ id: 301, name: "C" });
    renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1"
    );

    await awaitTutorCard(1);
    fireEvent.click(screen.getByRole("button", { name: /Unirse/i }));
    await screen.findByTestId("completa-1");
    expectCupos(1, "2/2");

    // 4) D ya no ve "Unirse"
    __setUser({ id: 302, name: "D" });
    renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1"
    );
    await awaitTutorCard(1);
    expect(screen.queryByRole("button", { name: /Unirse/i })).toBeNull();
  });

  test("Un tutor no ve el botón 'Unirse' en su propia tutoría", async () => {
    __setUser({ id: 101, name: "A" });
    await createPendingByStudent({ courseId: 1, studentId: 101, capacity: 2 });
    await joinAsTutor({ tutoringId: 1, tutorId: 201 });

    __setUser({ id: 201, name: "B (tutor)" });
    renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1"
    );

    await awaitTutorCard(1);
    expect(screen.getByTestId("soy-tutor-1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Unirse/i })).toBeNull();
  });

  test("No se listan tutorías finalizadas", async () => {
    __seedFinalizada({ courseId: 1, topicId: 10 }); 
    __setUser({ id: 101, name: "A" });
    await createPendingByStudent({ courseId: 1, topicId: 10, studentId: 101, capacity: 2 }); 
    await joinAsTutor({ tutoringId: 2, tutorId: 201 });

    __setUser({ id: 301, name: "C" });
    renderWithRouter(
      <Routes>
        <Route path="/tutorias" element={<TutoriasListMock />} />
      </Routes>,
      "/tutorias?course=1&topic=10"
    );

    await awaitTutorCard(2); 
    expect(screen.queryByLabelText("tutoria-1")).toBeNull(); 
    expectTutor(2, "201");
  });
});
