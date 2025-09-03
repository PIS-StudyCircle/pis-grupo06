import React from "react";
import CourseButton from "./CourseButton";

export default function CourseCard({ course }) {
    return (
        <div  className="bg-white border border-blue-200 rounded-lg shadow p-4 w-60 flex flex-col justify-between">
            <h2 className="text-blue-700 font-semibold text-lg mb-4">{course.name}</h2>
            <div className="flex gap-2">
                <CourseButton buttonName={"Temas"} onClick={""}></CourseButton>
                <CourseButton buttonName={"Tutores"} onClick={""}></CourseButton>
            </div>
        </div>
    );
}   