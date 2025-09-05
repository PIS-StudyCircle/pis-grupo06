import { useEffect } from "react";
import { useState } from "react";
import CourseCard from "../components/CourseCard";
import NavBar from "../components/NavBar";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
    const fetchCourses = async () => {
        try{
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/courses`);
          const data = await response.json();
          console.log(data);
          setCourses(data);
        }catch(error){
          //mostrar mensaje de error de alguna forma
          console.error("Error fetching courses:", error);
        }finally{
          setLoading(false);
        }
    };
    fetchCourses();
  }, []);

  if(loading){
    return <div>Cargando materias...</div>;
  }

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
          <div className="w-1/4 h-4/5 bg-white rounded-lg shadow-md">
          </div>
        </div>
      </div>
    </>
  );
}
