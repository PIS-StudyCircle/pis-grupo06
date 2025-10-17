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
    faculty: fing
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

  { name: "Clara", last_name: "Suárez", email: "clarasuarez@gmail.com" },
  { name: "Andrés", last_name: "Méndez", email: "andresmendez@gmail.com" },
  { name: "Paula", last_name: "Castro", email: "paulacastro@gmail.com" },
  { name: "Jorge", last_name: "Vega", email: "jorgevega@gmail.com" },
  { name: "Valentina", last_name: "Silva", email: "valentinasilva@gmail.com" },
  { name: "Rodrigo", last_name: "Torres", email: "rodrigotorres@gmail.com" },
  { name: "Florencia", last_name: "Pintos", email: "florenciapintos@gmail.com" },
  { name: "Mateo", last_name: "Ramos", email: "mateoramos@gmail.com" },
  { name: "Camila", last_name: "Sosa", email: "camilasosa@gmail.com" },
  { name: "Bruno", last_name: "Acosta", email: "brunoacosta@gmail.com" },

  { name: "Elena", last_name: "Domínguez", email: "elenadominguez@gmail.com" },
  { name: "Tomás", last_name: "Garrido", email: "tomasgarrido@gmail.com" },
  { name: "Natalia", last_name: "Guerra", email: "nataliaguerra@gmail.com" },
  { name: "Sebastián", last_name: "Aguilar", email: "sebastianaguilar@gmail.com" },
  { name: "Laura", last_name: "Maldonado", email: "lauramaldonado@gmail.com" },
  { name: "Ignacio", last_name: "Ferrer", email: "ignacioferrer@gmail.com" },
  { name: "Carolina", last_name: "Bermúdez", email: "carolinabermudez@gmail.com" },
  { name: "Pablo", last_name: "Villar", email: "pablovillar@gmail.com" },
  { name: "Agustina", last_name: "Benítez", email: "agustinabenitez@gmail.com" },
  { name: "Federico", last_name: "Cardozo", email: "federicocardozo@gmail.com" },

  { name: "Verónica", last_name: "Giménez", email: "veronicagimenez@gmail.com" },
  { name: "Esteban", last_name: "Peralta", email: "estebanperalta@gmail.com" },
  { name: "Rocío", last_name: "Vázquez", email: "rociovazquez@gmail.com" },
  { name: "Gabriel", last_name: "Correa", email: "gabrielcorrea@gmail.com" },
  { name: "Julieta", last_name: "Machado", email: "julietamachado@gmail.com" },
  { name: "Fernando", last_name: "Núñez", email: "fernandonunez@gmail.com" },
  { name: "Cecilia", last_name: "Morales", email: "ceciliamorales@gmail.com" },
  { name: "Ricardo", last_name: "Mujica", email: "ricardomujica@gmail.com" },
  { name: "Daniela", last_name: "Ruiz", email: "danielaruiz@gmail.com" },
  { name: "Gustavo", last_name: "Ortega", email: "gustavoortega@gmail.com" }
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
# ========================
course = Course.find_by(id: 443) # PIS
creator = User.find_by(email: "anaperez@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "Análisis de Requerimientos", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

Subject.find_or_create_by!(name: "Gestión de Riesgos", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Casos de Uso", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

# ========================
course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
creator = User.find_by(email: "martadaluz@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "Conjuntos", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Derivadas", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

Subject.find_or_create_by!(name: "Integrales simples", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Axiomas", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

# ========================
course = Course.find_by(id: 116) # Electrotécnica I
creator = User.find_by(email: "martinramirez@gmail.com") || User.first
# ========================
# ========================
Subject.find_or_create_by!(name: "Circuitos Eléctricos Básicos", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Leyes de Ohm y de Kirchhoff", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Potencia y Energía Eléctrica", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Generadores de Corriente Continua", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Motores de Corriente Continua", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Transformadores Eléctricos", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Medidas Eléctricas y Multímetros", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Protecciones y Seguridad Eléctrica", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Corriente Alterna: Magnitudes y Ondas", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Resonancia en Circuitos RLC", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

# ========================
course = Course.find_by(id: 145) # Física I
creator = User.find_by(email: "sofiagarcia@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "MCU", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

Subject.find_or_create_by!(name: "MRU", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Peso y masa", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

# ========================
course = Course.find_by(id: 185) # Geometría y Álgebra Lineal 1
creator = User.find_by(email: "luciafernandez@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "Geometría y Álgebra Lineal 1", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Operaciones con vectores", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

Subject.find_or_create_by!(name: "Matrices y determinantes", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

Subject.find_or_create_by!(name: "Base y dimensión", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

Subject.find_or_create_by!(name: "Sistemas de ecuaciones lineales", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Método de Gauss y Gauss-Jordan", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

Subject.find_or_create_by!(name: "Autovalores y autovectores", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

creator = User.find_by(email: "luciafernandez@gmail.com") || User.first

Subject.find_or_create_by!(name: "Espacios vectoriales", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Subespacios y bases", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Transformaciones lineales", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Núcleo e imagen", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Producto escalar y ortogonalidad", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Diagonalización de matrices", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Formas cuadráticas", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Aplicaciones a geometría", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Eigenespacios", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Cambio de base", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Determinantes avanzados", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Sistemas homogéneos", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Teorema espectral", course: course) do |s|
  s.creator = creator
end

Subject.find_or_create_by!(name: "Aplicaciones a física e ingeniería", course: course) do |s|
  s.creator = creator
end

# ========================
course = Course.find_by(id: 3) # Administración de Infraestructuras
creator = User.find_by(email: "anaperez@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "Gestión de Servidores", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

Subject.find_or_create_by!(name: "Redes y Comunicaciones", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Seguridad en Infraestructura", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

Subject.find_or_create_by!(name: "Monitoreo y Mantenimiento", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

# ========================
course = Course.find_by(id: 5) # Administración de Operaciones
creator = User.find_by(email: "luisgomez@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "Gestión de Procesos", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

Subject.find_or_create_by!(name: "Planificación de la Producción", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Gestión de la Calidad", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

Subject.find_or_create_by!(name: "Logística y Cadena de Suministro", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

# ========================
course = Course.find_by(id: 8) # Agrimensura Legal 1
creator = User.find_by(email: "luisgomez@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "Levantamiento Topográfico", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

Subject.find_or_create_by!(name: "Catastro y Planimetría", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Límites y Propiedad", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

Subject.find_or_create_by!(name: "Documentación Legal y Escrituras", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end

# ========================
course = Course.find_by(id: 13) # Algoritmos Evolutivos
creator = User.find_by(email: "mariarodriguez@gmail.com") || User.first
# ========================

Subject.find_or_create_by!(name: "Introducción a Algoritmos Evolutivos", course: course) do |s|
  s.creator = creator
  s.due_date = 3.months.from_now
end

Subject.find_or_create_by!(name: "Algoritmos Genéticos", course: course) do |s|
  s.creator = creator
  s.due_date = 4.months.from_now
end

Subject.find_or_create_by!(name: "Algoritmos de Enjambre", course: course) do |s|
  s.creator = creator
  s.due_date = 5.months.from_now
end

Subject.find_or_create_by!(name: "Optimización Multiobjetivo", course: course) do |s|
  s.creator = creator
  s.due_date = 6.months.from_now
end
# ------------------ TUTORIAS ------------------ #

# ---- SIN TUTOR ---- #
# Cuando un estudiante crea una solicitud de tutoría (tutor_id: nil),
# automáticamente se inscribe en ella (UserTutoring).

# Tutoría 1 creada por estudiante solicitándola, con 3 temas
creator = User.find_by!(email: "luisgomez@gmail.com")
course = Course.find_by(id: 185) # Geometría y Álgebra Lineal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..3))

tutoring_request = Tutoring.find_or_create_by!(
  scheduled_at: 6.days.from_now,
  duration_mins: 90,
  modality: "virtual",
  capacity: 3,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: nil # user_calendar.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_request)
end

# El creador de la solicitud se inscribe automáticamente
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_request
)

# Tutoría 2 creada por estudiante solicitándola, con 1 tema
creator = User.find_by!(email: "juanperez@gmail.com")
course = Course.find_by(id: 145) # Física I
subject = course.subjects.sample(1).first

tutoring_request = Tutoring.find_or_create_by!(
  scheduled_at: 3.days.from_now,
  duration_mins: 90,
  modality: "virtual",
  capacity: 1,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: nil # user_calendar.id
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_request)
# create_event_for_tutoring(service, calendar_id, tutoring_request)

# El creador de la solicitud se inscribe automáticamente
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_request
)

# Tutoría 3 creada por estudiante solicitándola, con 5 temas
creator = User.find_by!(email: "anaperez@gmail.com")
course = Course.find_by(id: 185) # Geometría y Álgebra Lineal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..5))

tutoring_request = Tutoring.find_or_create_by!(
  scheduled_at: 4.days.from_now,
  duration_mins: 90,
  modality: "virtual",
  capacity: 1,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: nil # user_calendar.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_request)
end

# El creador de la solicitud se inscribe automáticamente
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_request
)

# Tutoría 3 repetida con 5 temas
creator = User.find_by!(email: "anaperez@gmail.com")
course = Course.find_by(id: 185) # Geometría y Álgebra Lineal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..5))

tutoring_request = Tutoring.find_or_create_by!(
  scheduled_at: 7.days.from_now,
  duration_mins: 180,
  modality: "virtual",
  capacity: 1,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: nil
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_request)
end

# El creador de la solicitud se inscribe automáticamente
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_request
)

# ---- CON TUTOR = USUARIO QUE LA CREA ---- #
# Cuando un tutor crea una oferta de tutoría (tutor_id: present),
# también se crea UserTutoring para vincular al tutor con la tutoría.

# Tutoría 4 creada por estudiante dictándola
creator = User.find_by!(email: "anaperez@gmail.com")
course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
subject = course.subjects.sample(1).first

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 5.days.from_now,
  duration_mins: 60,
  modality: "presencial",
  capacity: 2,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id,
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)

# El tutor se asocia a su propia tutoría
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 5 creada por estudiante dictándola
creator = User.find_by!(email: "martadaluz@gmail.com")
course = Course.find_by(id: 116) # Electrotécnica I
subjects = Subject.where(course: course).shuffle.take(rand(1..7))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 7.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 5,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

# El tutor se asocia a su propia tutoría
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 6 creada por estudiante dictándola
creator = User.find_by!(email: "veronicagimenez@gmail.com")
course = Course.find_by(id: 116) # Electrotécnica I
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 7.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 5,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 7 creada por estudiante dictándola
creator = User.find_by!(email: "veronicagimenez@gmail.com")
course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
subjects = Subject.where(course: course).shuffle.take(rand(1..3))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 10.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 5,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 8 creada por estudiante dictándola
creator = User.find_by!(email: "rociovazquez@gmail.com")
course = Course.find_by(id: 443) # PIS
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 2.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 5,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 9 creada por estudiante dictándola
creator = User.find_by!(email: "pablovillar@gmail.com")
course = Course.find_by(id: 443) # PIS
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 5.days.from_now,
  duration_mins: 60,
  modality: "presencial",
  capacity: 14,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 10 creada por estudiante dictándola
creator = User.find_by!(email: "agustinabenitez@gmail.com")
course = Course.find_by(id: 145) # Física I
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 3.days.from_now,
  duration_mins: 60,
  modality: "presencial",
  capacity: 20,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 11 creada por estudiante dictándola
creator = User.find_by!(email: "agustinabenitez@gmail.com")
course = Course.find_by(id: 145) # Física I
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 7.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 10,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 12 creada por estudiante dictándola
creator = User.find_by!(email: "tomasgarrido@gmail.com")
course = Course.find_by(id: 185) # Geometría y Álgebra Lineal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..3))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 2.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 10,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 13 creada por estudiante dictándola
creator = User.find_by!(email: "tomasgarrido@gmail.com")
course = Course.find_by(id: 13) # Algoritmos Evolutivos
subjects = Subject.where(course: course).shuffle.take(rand(1..4))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 5.days.from_now,
  duration_mins: 30,
  modality: "virtual",
  capacity: 10,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 14 creada por estudiante dictándola
creator = User.find_by!(email: "lauramaldonado@gmail.com")
course = Course.find_by(id: 13) # Algoritmos Evolutivos
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 7.days.from_now,
  duration_mins: 60,
  modality: "presencial",
  capacity: 10,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 15 creada por estudiante dictándola
creator = User.find_by!(email: "lauramaldonado@gmail.com")
course = Course.find_by(id: 13) # Algoritmos Evolutivos
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 5.days.from_now,
  duration_mins: 45,
  modality: "presencial",
  capacity: 10,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 16 creada por estudiante dictándola
creator = User.find_by!(email: "tomasgarrido@gmail.com")
course = Course.find_by(id: 13) # Algoritmos Evolutivos
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 10.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 15,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 17 creada por estudiante dictándola
creator = User.find_by!(email: "luisgomez@gmail.com")
course = Course.find_by(id: 13) # Algoritmos Evolutivos
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 8.days.from_now,
  duration_mins: 30,
  modality: "virtual",
  capacity: 15,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 18 creada por estudiante dictándola
creator = User.find_by!(email: "sofiagarcia@gmail.com")
course = Course.find_by(id: 8) # Agrimensura Legal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 5.days.from_now,
  duration_mins: 60,
  modality: "virtual",
  capacity: 15,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 19 creada por estudiante dictándola
creator = User.find_by!(email: "paulacastro@gmail.com")
course = Course.find_by(id: 8) # Agrimensura Legal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..3))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 3.days.from_now,
  duration_mins: 60,
  modality: "presencial",
  capacity: 10,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)

# Tutoría 20 creada por estudiante dictándola
creator = User.find_by!(email: "martadaluz@gmail.com")
course = Course.find_by(id: 8) # Agrimensura Legal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..3))

tutoring_offered = Tutoring.find_or_create_by!(
  scheduled_at: 3.days.from_now,
  duration_mins: 60,
  modality: "presencial",
  capacity: 10,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered)
end

UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered
)
