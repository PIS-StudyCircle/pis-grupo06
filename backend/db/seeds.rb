# db/seeds.rb
require 'json'
require 'securerandom'

# ------ FACULTADES Y CURSOS ------
uni = University.find_or_create_by!(name: "Universidad de la República")
fing = Faculty.find_or_create_by!(name: "Facultad de Ingeniería", university: uni)

Rails.logger.debug "Seeding courses from JSON..."
file_path = Rails.root.join("db/courses.json")
json_data = JSON.parse(File.read(file_path))

json_data.each do |entry|
  Course.find_or_create_by!(
    name: entry['nombre'],
    code: entry['codigo'],
    institute: entry['instituto'],
    faculty: fing,
  )
end

# ------ USUARIOS ------
students = [
  { name: "Ana", last_name: "Pérez", email: "anaperez@gmail.com" },
  { name: "Luis", last_name: "Gómez", email: "luisgomez@gmail.com" },
  { name: "María", last_name: "Rodríguez", email: "mariarodriguez@gmail.com" },
  { name: "Juan", last_name: "Pérez", email: "juanperez@gmail.com" },
  { name: "Marta", last_name: "Da Luz", email: "martadaluz@gmail.com" },
  { name: "Carlos", last_name: "López", email: "carloslopez@gmail.com" },
  { name: "Lucía", last_name: "Fernández", email: "luciafernandez@gmail.com" },
  { name: "Diego", last_name: "Martínez", email: "diegomartinez@gmail.com" },
  { name: "Sofía", last_name: "García", email: "sofiagarcia@gmail.com" },
  { name: "Martín", last_name: "Ramírez", email: "martinramirez@gmail.com" },
]

students.each do |student_data|
  User.find_or_create_by!(email: student_data[:email]) do |user|
    user.name = student_data[:name]
    user.last_name = student_data[:last_name]
    user.faculty = fing
    user.password = "password123"
    user.password_confirmation = "password123"
    user.description = "Estudiante de ejemplo"
    user.jti = SecureRandom.uuid
  end
end

# ------ TEMAS DE MATERIAS ------

# Crear subjects para un curso
course = Course.find_by(id: 443) # PIS
creator = User.find_by(email: "anaperez@gmail.com") || User.first

Subject.find_or_create_by!(name: "Análisis de Requerimientos", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Gestión de Riesgos", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Casos de Uso", course: course) do |s|
  s.creator = creator
end

course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
creator = User.find_by(email: "martadaluz@gmail.com") || User.first

Subject.find_or_create_by!(name: "Conjuntos", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Derivadas", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Integrales simples", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Axiomas", course: course) do |s|
  s.creator = creator
end

course = Course.find_by(id: 116) # Electrotécnica I
creator = User.find_by(email: "martinramirez@gmail.com") || User.first

Subject.find_or_create_by!(name: "Circuitos Eléctricos Básicos", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Ley de Ohm y Leyes de Kirchhoff", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Resistencias y Asociación de Resistencias", course: course) do |s|
  s.creator = creator
end

course = Course.find_by(id: 145) # Fisica I
creator = User.find_by(email: "sofiagarcia@gmail.com") || User.first

Subject.find_or_create_by!(name: "MCU", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "MRU", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Peso y masa", course: course) do |s|
  s.creator = creator
end

course = Course.find_by(id: 185) # Geometría y Álgebra Lineal 1
creator = User.find_by(email: "luciafernandez@gmail.com") || User.first

Subject.find_or_create_by!(name: "Geometría y Álgebra Lineal 1", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Operaciones con vectores", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Matrices y determinantes", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Base y dimensión", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Sistemas de ecuaciones lineales", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Método de Gauss y Gauss-Jordan", course: course) do |s|
  s.creator = creator
end
Subject.find_or_create_by!(name: "Autovalores y autovectores", course: course) do |s|
  s.creator = creator
end
