# Facultades y Universidad base (si todavía no tenés ninguna)
uni = University.find_or_create_by!(name: "Universidad de la República")
fing = Faculty.find_or_create_by!(name: "Facultad de Ingeniería", university: uni)

# Materias (Courses)
courses = [
  "Cálculo 1",
  "GAL 1",
  "Matemática Discreta"
]

courses.each do |course_name|
  Course.find_or_create_by!(name: course_name, faculty: fing)
end

puts "Seed creado exitosamente"
