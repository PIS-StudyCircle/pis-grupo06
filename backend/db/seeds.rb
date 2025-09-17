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

# Cargamos algunos estudiantes de ejemplo
students = [
  { name: "Ana", last_name: "Pérez", email: "anaperez@gmail.com" },
  { name: "Luis", last_name: "Gómez", email: "luisgomez@gmail.com" },
  { name: "María", last_name: "Rodríguez", email: "mariarodriguez@gmail.com" },
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

# Crear subjects para un curso
course = Course.find_by(code: "1721") #PIS
creator = User.find_by(email: "anaperez@gmail.com") || User.first

(1..5).each do |i|
  Subject.find_or_create_by!(name: "tema_#{i}", course: course) do |s|
    s.creator = creator
  end
end

# Crear algunas tutorías de ejemplo
# Tutoría 1 creada por estudiante solicitandola
tutor   = User.find_by!(email: "luisgomez@gmail.com")
subject = Subject.find_by!(course: course, name: "tema_1")

tutoring_request = Tutoring.create!(
  scheduled_at:   Time.zone.now + 3.days,
  duration_mins:  90,
  modality:       "virtual",    
  capacity:       3,
  enrolled:       0,            
  course:         course,
  created_by_id:  creator.id,   
  tutor_id:       nil           
)
SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_request)

# Tutoría 2 creada por estudiante dictandola
tutoring_offered = Tutoring.create!(
  scheduled_at:   Time.zone.now + 5.days,
  duration_mins:  60,
  modality:       "presencial",
  capacity:       2,
  enrolled:       0,
  course:         course,
  created_by_id:  tutor.id,    
  tutor_id:       tutor.id     
)
SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)