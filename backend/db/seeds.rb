require 'json'

# Facultades y Universidad base (si todavía no tenés ninguna)
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

test_user = User.find_or_create_by!(email: "test@gmail.com") do |u|
  u.name                  = "Usuario"
  u.last_name             = "Prueba"
  u.password              = "password123"
  u.password_confirmation = "password123"
  u.description           = "Test user"
  u.faculty               = fing
end

Subject.find_or_create_by!(name: "Tema 1 - Test", course_id: 1, creator_id: test_user.id)
Subject.find_or_create_by!(name: "Tema 2 - Test", course_id: 1, creator_id: test_user.id)

Rails.logger.debug { "Finished seeding courses. Total courses: #{Course.count}" }
