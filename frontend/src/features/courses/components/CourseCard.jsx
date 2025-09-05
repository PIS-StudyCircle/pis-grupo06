import React from "react";

export default function CourseCard({ course }) {
  return (
    <div className="h-20 bg-white rounded-lg shadow p-4 my-4 w-full flex flex-col justify-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
      <h2 className="text-black font-semibold text-lg">{course.name}</h2>
    </div>
  );
}
