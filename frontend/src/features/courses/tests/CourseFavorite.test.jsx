jest.mock("@context/UserContext", () => ({ useUser: jest.fn() }));

jest.mock("../services/courseService", () => ({
  favoriteCourse: jest.fn(),
  unfavoriteCourse: jest.fn(),
  getCourseByID: jest.fn(),
  getMyFavoriteCourses: jest.fn(),
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
    useUser.mockReturnValue({ user: { id: 1 } });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("CoursePage alterna filtro 'Favoritos' mostrando solo favoritos y vuelve a mostrar todos", async () => {
    const fav = { id: 1, name: "Curso Fav", favorite: true };
    const nonFav = { id: 2, name: "Curso NoFav", favorite: false };

    let onlyFavorites = false;
    const setShowFavorites = jest.fn((val) => {
      onlyFavorites = val;
    });

    useCourses.mockImplementation(() => ({
      courses: onlyFavorites ? [fav] : [fav, nonFav],
      loading: false,
      error: null,
      pagination: { page: 1, last: 1 },
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
      showFavorites: onlyFavorites,
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

    rerender(
      <MemoryRouter>
        <CoursePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Curso Fav")).toBeInTheDocument();
    expect(screen.queryByText("Curso NoFav")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /Favoritos/i }));
    expect(setShowFavorites).toHaveBeenCalledWith(false);

    rerender(
      <MemoryRouter>
        <CoursePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Curso Fav")).toBeInTheDocument();
    expect(screen.getByText("Curso NoFav")).toBeInTheDocument();
  });

  it("No se muestran botones de favorito cuando no hay usuario", async () => {
    useUser.mockReturnValue({ user: null });

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

  it("ProfilePage muestra las materias favoritas del usuario", async () => {
    useUser.mockReturnValue({
      user: { id: 1, name: "Usuario", last_name: "Test", email: "test@test.com" },
    });

    courseService.getMyFavoriteCourses.mockResolvedValueOnce([
      { id: 1, name: "Favorita A", code: "FA" },
      { id: 2, name: "Favorita B", code: "FB" },
    ]);

    renderProfilePage();

    // espera que el título del panel y las materias aparezcan
    expect(await screen.findByText(/Materias favoritas/i)).toBeInTheDocument();
    expect(await screen.findByText("Favorita A")).toBeInTheDocument();
    expect(screen.getByText("Favorita B")).toBeInTheDocument();
  });

  it("ProfilePage muestra mensaje cuando no hay materias favoritas", async () => {
    useUser.mockReturnValue({
      user: { id: 1, name: "Usuario", last_name: "Test", email: "test@test.com" },
    });

    courseService.getMyFavoriteCourses.mockResolvedValueOnce([]);

    renderProfilePage();

    expect(await screen.findByText(/Aún no tenés materias favoritas/i)).toBeInTheDocument();
  });
});