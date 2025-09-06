import NavBar from "@components/NavBar";
import CourseCard from "../components/CourseCard";
import { useCourses } from "../hooks/useCourses";

export default function CoursePage() {
  const { courses, loading, error, pagination, page, setPage } = useCourses();
  const totalPages = pagination.last; // or compute: Math.ceil(pagination.count / perPage)

  if (loading) return <div>Cargando materias...</div>;
  if (error) return <div>Error al cargar las materias 😢</div>;

  return (
   <>
      <NavBar />
      <div className="flex justify-center min-h-screen bg-[#f3f8f9] p-4">
        <div className="flex w-full container gap-4">
          <div className= "w-1/4 h-4/5 bg-white rounded-lg shadow-md">
          </div>
          <div className="justify-start w-3/4 px-6 container">
            <h1 className="flex text-2xl font-bold p-2 mb-4 text-black">Materias Disponibles</h1>
            {courses.length === 0 ? (
              <div>No hay materias disponibles</div>
            ) : (
              courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
          {totalPages > 1 && (
            <ReactPaginate
              forcePage={pagination.page - 1}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={({ selected }) => setPage(selected + 1)}
              previousLabel="<"
              nextLabel=">"
              containerClassName="pagination"
              activeClassName="active"
            />
          )}
          <div className="w-1/4 h-4/5 bg-white rounded-lg shadow-md">
          </div>
        </div>
      </div>
    </>
  );
}
