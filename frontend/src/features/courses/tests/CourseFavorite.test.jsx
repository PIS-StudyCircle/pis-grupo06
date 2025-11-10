jest.mock("@context/UserContext", () => ({ useUser: jest.fn() }));

jest.mock("../services/courseService", () => ({
  favoriteCourse: jest.fn(),
  unfavoriteCourse: jest.fn(),
  getCourseByID: jest.fn(),
  getMyFavoriteCourses: jest.fn(),
  getCourses: jest.fn(),
}));

jest.mock("../hooks/useCourses", () => ({ useCourses: jest.fn() }));

jest.mock("../../subjects/pages/SubjectPage", () => (props) => <div>Mock SubjectPage - courseId: {props.courseId}</div>);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CourseDetailPage from "../pages/CourseDetailPage";
import CourseCard from "../components/CourseCard";
import CoursePage from "../pages/CoursePage";
import * as courseService from "../services/courseService";
import { useUser } from "@context/UserContext";
import { useCourses } from "../hooks/useCourses";
import Profile from "../../users/pages/ProfilePage";

function renderCourseCard(course) {
  return render(
    <MemoryRouter>
      <CourseCard course={course} />
    </MemoryRouter>
  );
}

function renderCourseDetail(courseId) {
  return render(
    <MemoryRouter initialEntries={[`/materias/${courseId}`]}>
      <Routes>
        <Route path="/materias/:courseId" element={<CourseDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderProfilePage() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}

describe("Favoritos - CoursePage, CourseCard y CourseDetailPage", () => {
  beforeEach(() => {
    useUser.mockReturnValue({
      user: { id: 1 },
      refetchCurrentUser: jest.fn().mockResolvedValue(),
      booting: false
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("CoursePage alterna filtro 'Favoritos' mostrando solo favoritos y vuelve a mostrar todos (mock rerender)", async () => {
    const fav = { id: 1, name: "Curso Fav", favorite: true };
    const nonFav = { id: 2, name: "Curso NoFav", favorite: false };

    const setShowFavorites = jest.fn();

    useCourses.mockImplementation(() => ({
      courses: [fav, nonFav],
      loading: false,
      error: null,
      pagination: { page: 1, last: 1 },
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
      showFavorites: false,
      setShowFavorites,
    }));

    const { rerender } = render(
      <MemoryRouter>
        <CoursePage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Curso Fav")).toBeInTheDocument();
    expect(screen.getByText("Curso NoFav")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", { name: /Favoritos/i });
    fireEvent.click(checkbox);
    expect(setShowFavorites).toHaveBeenCalledWith(true);

    useCourses.mockImplementation(() => ({
      courses: [fav],
      loading: false,
      error: null,
      pagination: { page: 1, last: 1 },
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
      showFavorites: true,
      setShowFavorites,
    }));

    rerender(
      <MemoryRouter>
        <CoursePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Curso Fav")).toBeInTheDocument();
    expect(screen.queryByText("Curso NoFav")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /Favoritos/i }));
    expect(setShowFavorites).toHaveBeenCalledWith(false);

    useCourses.mockImplementation(() => ({
      courses: [fav, nonFav],
      loading: false,
      error: null,
      pagination: { page: 1, last: 1 },
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
      showFavorites: false,
      setShowFavorites,
    }));

    rerender(
      <MemoryRouter>
        <CoursePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Curso Fav")).toBeInTheDocument();
    expect(screen.getByText("Curso NoFav")).toBeInTheDocument();
  });

  it("No se muestran botones de favorito cuando no hay usuario", async () => {
    useUser.mockReturnValue({
      user: null,
      refetchCurrentUser: jest.fn().mockResolvedValue(),
      booting: false
    });

    renderCourseCard({ id: 1, name: "Favoriteable", favorite: false });
    expect(screen.queryByRole("button", { name: /Agregar a favoritos/i })).not.toBeInTheDocument();
    cleanup();

    courseService.getCourseByID.mockResolvedValueOnce({
      id: 1,
      name: "Favoriteable",
      subjects: [],
      favorite: false,
    });

    renderCourseDetail(1);

    expect(await screen.findByText("Favoriteable")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Agregar a favoritos/i })).not.toBeInTheDocument();
  });

  it("Favoritear curso en CourseCard", async () => {
    const course = { id: 1, name: "Favoriteable", favorite: false };
    courseService.favoriteCourse.mockResolvedValueOnce({ favorite: true });

    renderCourseCard(course);

    const btn = screen.getByRole("button", { name: /Agregar a favoritos/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(courseService.favoriteCourse).toHaveBeenCalledWith(1);
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Quitar de favoritos/i })).toBeInTheDocument()
    );
  });

  it("Desfavoritear curso en CourseCard", async () => {
    const course = { id: 1, name: "Desfavoriteable", favorite: true };
    courseService.unfavoriteCourse.mockResolvedValueOnce({ favorite: false });

    renderCourseCard(course);

    const btn = screen.getByRole("button", { name: /Quitar de favoritos/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(courseService.unfavoriteCourse).toHaveBeenCalledWith(1);
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Agregar a favoritos/i })).toBeInTheDocument()
    );
  });

  it("Favoritear curso en CourseDetailPage", async () => {
    courseService.getCourseByID.mockResolvedValueOnce({
      id: 1,
      name: "Favoriteable",
      subjects: [],
      favorite: false,
    });
    courseService.favoriteCourse.mockResolvedValueOnce({ favorite: true });

    renderCourseDetail(1);

    expect(await screen.findByText("Favoriteable")).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /Agregar a favoritos/i });
    fireEvent.click(btn);

    await waitFor(() => expect(courseService.favoriteCourse).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Quitar de favoritos/i })).toBeInTheDocument()
    );
  });

  it("Desfavoritear curso en CourseDetailPage", async () => {
    courseService.getCourseByID.mockResolvedValueOnce({
      id: 1,
      name: "Desfavoriteable",
      subjects: [],
      favorite: true,
    });
    courseService.unfavoriteCourse.mockResolvedValueOnce({ favorite: false });

    renderCourseDetail(1);

    expect(await screen.findByText("Desfavoriteable")).toBeInTheDocument();

    const btn = await screen.findByRole("button", { name: /Quitar de favoritos/i });

    fireEvent.click(btn);

    await waitFor(() => expect(courseService.unfavoriteCourse).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Agregar a favoritos/i })).toBeInTheDocument()
    );
  });

it("ProfilePage muestra error si getMyFavoriteCourses falla", async () => {
  useUser.mockReturnValue({
    user: { id: 1, name: "Usuario", last_name: "Test", email: "test@test.com" },
    refetchCurrentUser: jest.fn().mockResolvedValue(),
    booting: false
  });

  courseService.getCourses.mockRejectedValueOnce(new Error("Server error"));

  renderProfilePage();
  expect(await screen.findByText(/Server error/i)).toBeInTheDocument();
});


  it("ProfilePage muestra las materias favoritas del usuario", async () => {
    useUser.mockReturnValue({
      user: { id: 1, name: "Usuario", last_name: "Test", email: "test@test.com" },
      refetchCurrentUser: jest.fn().mockResolvedValue(),
      booting: false
    });

    // ProfilePage espera un objeto con { courses: [...] }
    courseService.getCourses.mockResolvedValueOnce({
      courses: [
        { id: 1, name: "Favorita A", code: "FA" },
        { id: 2, name: "Favorita B", code: "FB" },
      ],
    });

    renderProfilePage();

    expect(await screen.findByText(/Materias favoritas/i)).toBeInTheDocument();
    expect(await screen.findByText("Favorita A")).toBeInTheDocument();
    expect(screen.getByText("Favorita B")).toBeInTheDocument();
  });

  it("ProfilePage muestra mensaje cuando no hay materias favoritas", async () => {
    useUser.mockReturnValue({
      user: { id: 1, name: "Usuario", last_name: "Test", email: "test@test.com" },
      refetchCurrentUser: jest.fn().mockResolvedValue(),
      booting: false
    });

    courseService.getCourses.mockResolvedValueOnce({ courses: [] });

    renderProfilePage();

    expect(await screen.findByText(/Aún no tenés materias favoritas/i)).toBeInTheDocument();
  });

  it("Si favoriteCourse falla, el botón no cambia en CourseCard", async () => {
    const course = { id: 42, name: "FailFav", favorite: false };
    courseService.favoriteCourse.mockRejectedValueOnce(new Error("API down"));

    renderCourseCard(course);

    const btn = screen.getByRole("button", { name: /Agregar a favoritos/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(courseService.favoriteCourse).toHaveBeenCalledWith(42);
    });

    expect(screen.getByRole("button", { name: /Agregar a favoritos/i })).toBeInTheDocument();
  });

  it("CourseDetailPage muestra estado inicial del favorito", async () => {
    courseService.getCourseByID.mockResolvedValueOnce({
      id: 7,
      name: "Detalle Fav",
      subjects: [],
      favorite: true,
    });

    renderCourseDetail(7);

    expect(await screen.findByText("Detalle Fav")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quitar de favoritos/i })).toBeInTheDocument();
    });

    jest.clearAllMocks();
    courseService.getCourseByID.mockResolvedValueOnce({
      id: 8,
      name: "Detalle NoFav",
      subjects: [],
      favorite: false,
    });

    renderCourseDetail(8);

    expect(await screen.findByText("Detalle NoFav")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agregar a favoritos/i })).toBeInTheDocument();
  });
});
