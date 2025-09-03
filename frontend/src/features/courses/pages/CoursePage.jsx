import { useEffect } from "react";
import { useState } from "react";
import CourseCard from "../components/CourseCard";

export default function CoursePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        const fetchCourses = async () => {
            try{
                const response = await fetch("http://localhost:3000/api/v1/courses");
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
        <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {courses.length === 0 ? (
                <div>No hay materias disponibles</div>
            ) : (
                courses.map((course) => (
                <CourseCard key={course.id} course={course} />
                ))
            )}
            </div>
        </div>
    );

}