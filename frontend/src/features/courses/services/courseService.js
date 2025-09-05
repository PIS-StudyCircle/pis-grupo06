export const getCourses = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/courses`);
  if (!response.ok) throw new Error("Error fetching courses");
  return response.json();
};
