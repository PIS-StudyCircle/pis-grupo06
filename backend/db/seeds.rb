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
  { name: "Gustavo", last_name: "Ortega", email: "gustavoortega@gmail.com" },

  { name: "Silvana", last_name: "Navarro", email: "silvananavarro@gmail.com" },
  { name: "Emiliano", last_name: "Delgado", email: "emilianodelgado@gmail.com" },
  { name: "Patricia", last_name: "Cabrera", email: "patriciacabrera@gmail.com" },
  { name: "Nicolás", last_name: "Funes", email: "nicolasfunes@gmail.com" },
  { name: "Ariana", last_name: "Rossi", email: "arianarossi@gmail.com" },
  { name: "Leonel", last_name: "Pereyra", email: "leonelpereyra@gmail.com" }

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

# creo un subject con due_date anterior a hoy para testear el job de eliminación/renovación
Subject.find_or_create_by!(name: "Pruebas de Software", course: course) do |s|
  s.creator = creator
  s.due_date = 2.months.ago
end

Subject.find_or_create_by!(name: "Modelado UML", course: course) do |s|
  s.creator = creator
  s.due_date = 1.month.ago
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

# ------PENDIENTES-----#

# ---- SIN TUTOR = ESTUDIANTE QUE CREA LA SOLICITUD ---- #

# Condiciones:
#   - solo un user tutoring (usuario que la creó)
#   - tutor_id: nil
#   - created_by_id: id del usuario que la creó
#   - capacity: nil
#   - enrolled: nil
#   - STATE: PENDING
#   - scheduled_at: nil
#   - al menos 1 tutoring availability, pero todos con is_booked: false
#   - al menos 1 subject_tutorings

# Tutoría 1
creator = User.find_by!(email: "silvananavarro@gmail.com")
course = Course.find_by(id: 185) # Geometría y Álgebra Lineal 1
subjects = Subject.where(course: course).shuffle.take(rand(1..5))

tutoring_request_pending = Tutoring.find_or_create_by!(
  scheduled_at: nil,
  modality: "virtual",
  course: course,
  created_by_id: creator.id,
  tutor_id: nil,
  state: 0,
  duration_mins: 1
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_request_pending)
end

# El creador de la solicitud se inscribe automáticamente
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_request_pending
)

# Crear disponibilidad para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_request_pending,
  start_time: 7.days.from_now.change(hour: 9, min: 0),
  end_time: 7.days.from_now.change(hour: 12, min: 0),
  is_booked: false
)

# Tutoría 2
creator = User.find_by!(email: "emilianodelgado@gmail.com")
course = Course.find_by(id: 145) # Física 1
subjects = Subject.where(course: course).shuffle.take(rand(1..2))

tutoring_request_pending2 = Tutoring.find_or_create_by!(
  scheduled_at: nil,
  modality: "virtual",
  course: course,
  created_by_id: creator.id,
  tutor_id: nil,
  state: 0,
  duration_mins: 1
)

subjects.each do |subject|
  SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_request_pending2)
end

# El creador de la solicitud se inscribe automáticamente
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_request_pending2
)

# Crear disponibilidad para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_request_pending2,
  start_time: 7.days.from_now.change(hour: 9, min: 0),
  end_time: 7.days.from_now.change(hour: 12, min: 0),
  is_booked: false
)

TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_request_pending2,
  start_time: 5.days.from_now.change(hour: 10, min: 0),
  end_time: 5.days.from_now.change(hour: 16, min: 0),
  is_booked: false
)

# ---- CON TUTOR = TUTOR QUE CREA LA TUTORIA ---- #

# Condiciones:
#   - ningun user tutoring
#   - tutor_id: creator_id
#   - created_by_id: creator_id
#   - capacity: x
#   - enrolled: nil
#   - STATE: PENDING
#   - scheduled_at: nil
#   - al menos 1 tutoring availability, pero todos con is_booked: false
#   - al menos 1 subject_tutorings

# Tutoría 3
creator = User.find_by!(email: "patriciacabrera@gmail.com")
course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
subject = course.subjects.sample(1).first

tutoring_offered_pending = Tutoring.find_or_create_by!(
  scheduled_at: nil,
  modality: "presencial",
  capacity: 2,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id,
  state: 0,
  duration_mins: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered_pending)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_pending,
  start_time: 5.days.from_now.change(hour: 14, min: 0),
  end_time: 5.days.from_now.change(hour: 15, min: 0),
  is_booked: false
)

TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_pending,
  start_time: 5.days.from_now.change(hour: 17, min: 0),
  end_time: 5.days.from_now.change(hour: 18, min: 0),
  is_booked: false
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered_pending
)

# Tutoría 4
creator = User.find_by!(email: "nicolasfunes@gmail.com")
course = Course.find_by(id: 116) # Electrotécnica I
subject = course.subjects.sample(1).first

tutoring_offered_pending2 = Tutoring.find_or_create_by!(
  scheduled_at: nil,
  modality: "virtual",
  capacity: 4,
  enrolled: 0,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id,
  state: 0,
  duration_mins: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered_pending2)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_pending2,
  start_time: 4.days.from_now.change(hour: 13, min: 0),
  end_time: 4.days.from_now.change(hour: 19, min: 0),
  is_booked: false
)

TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_pending2,
  start_time: 8.days.from_now.change(hour: 17, min: 0),
  end_time: 8.days.from_now.change(hour: 18, min: 0),
  is_booked: false
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered_pending2
)

# ------ACTIVAS-----#

# Condiciones:
#   - al menos 1 estudiante -> al menos 1 user_tutoring
#   - tutor_id: tutor_id
#   - created_by_id: creator_id
#   - capacity: x
#   - enrolled: al menos
#   - STATE: ACTIVE - 1
#   - scheduled_at: correspondiente a una fecha futura, de la tutoring_availabilities con is_booked: true
#   - duration_mins: coherente
#   - al menos 1 tutoring availability en is_booked: true, si hay mas tienen is_booked: false
#   - al menos 1 subject_tutorings

# Tutoría 5 - creada por el tutor
creator = User.find_by!(email: "nicolasfunes@gmail.com")
course = Course.find_by(id: 116) # Electrotécnica I
subject = course.subjects.sample(1).first

start_time = 4.days.from_now.change(hour: 13, min: 0) # concide con una de las tutoring availabilities

tutoring_offered_active = Tutoring.find_or_create_by!(
  scheduled_at: start_time,
  modality: "virtual",
  capacity: 4,
  enrolled: 1,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id,
  duration_mins: 60,
  state: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered_active)

estudiante = User.find_by!(email: "arianarossi@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante,
  tutoring: tutoring_offered_active
)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_active,
  start_time: 4.days.from_now.change(hour: 13, min: 0),
  end_time: 4.days.from_now.change(hour: 19, min: 0),
  is_booked: true
)

TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_active,
  start_time: 8.days.from_now.change(hour: 17, min: 0),
  end_time: 8.days.from_now.change(hour: 18, min: 0),
  is_booked: false
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered_active
)

# Tutoría 6 - creada por el estudiante
creator = User.find_by!(email: "silvananavarro@gmail.com")
course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
subject = course.subjects.sample(1).first
tutor = User.find_by!(email: "leonelpereyra@gmail.com")

start_time = 13.days.from_now.change(hour: 13, min: 0) # concide con una de las tutoring availabilities

tutoring_requested_active = Tutoring.find_or_create_by!(
  scheduled_at: start_time,
  modality: "virtual",
  capacity: 3,
  enrolled: 2,
  course: course,
  created_by_id: creator.id,
  tutor_id: tutor.id,
  duration_mins: 60,
  state: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_requested_active)

# usuario que creó la solicitud se asocia automáticamente
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_requested_active
)

estudiante = User.find_by!(email: "arianarossi@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante,
  tutoring: tutoring_requested_active
)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_requested_active,
  start_time: 13.days.from_now.change(hour: 12, min: 0),
  end_time: 13.days.from_now.change(hour: 16, min: 0),
  is_booked: true
)

TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_requested_active,
  start_time: 8.days.from_now.change(hour: 17, min: 0),
  end_time: 8.days.from_now.change(hour: 18, min: 0),
  is_booked: false
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: tutor,
  tutoring: tutoring_requested_active
)

# ------FINALIZADAS-----#

# Condiciones:
#   - al menos 1 estudiante -> al menos 1 user_tutoring
#   - tutor_id: tutor_id
#   - created_by_id: creator_id
#   - capacity: x
#   - enrolled: al menos 1
#   - STATE: FINALIZADA - 2
#   - scheduled_at: correspondiente a una fecha pasada, de la tutoring_availabilities con is_booked: true
#   - duration_mins: coherente
#   - al menos 1 tutoring availability en is_booked: true, si hay mas tienen is_booked: false
#   - al menos 1 subject_tutorings

# Tutoría 7 - creada por el tutor

# Se crea con fechas futuras y luego se actualiza

creator = User.find_by!(email: "nicolasfunes@gmail.com")
course = Course.find_by(id: 116) # Electrotécnica I
subject = course.subjects.sample(1).first

start_time = 4.days.from_now.change(hour: 13, min: 0) # concide con una de las tutoring availabilities

tutoring_offered_finished = Tutoring.find_or_create_by!(
  scheduled_at: start_time,
  modality: "virtual",
  capacity: 2,
  enrolled: 2,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id,
  duration_mins: 60,
  state: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered_finished)

estudiante = User.find_by!(email: "arianarossi@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante,
  tutoring: tutoring_offered_finished
)

estudiante2 = User.find_by!(email: "patriciacabrera@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante2,
  tutoring: tutoring_offered_finished
)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_finished,
  start_time: 4.days.from_now.change(hour: 13, min: 0),
  end_time: 4.days.from_now.change(hour: 19, min: 0),
  is_booked: true
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered_finished
)

# Actualizo a finalizada

tutoring_offered_finished.state = 2
tutoring_offered_finished.scheduled_at = 6.days.ago.change(hour: 13, min: 0)
tutoring_offered_finished.duration_mins = 60
tutoring_offered_finished.save!(validate: false)
# para que me deje poner una fecha del pasado aunque la db no lo permite

availability = TutoringAvailability.find_by(tutoring: tutoring_offered_finished)
availability.update!(
  start_time: 6.days.ago.change(hour: 13, min: 0),
  end_time: 6.days.ago.change(hour: 19, min: 0)
)

# Para probar el ranking con feedback de tutoría pasadas
Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante2.id,
                            tutoring_id: tutoring_offered_finished.id,
                            rating: 3)

Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante.id,
                            tutoring_id: tutoring_offered_finished.id,
                            rating: 5)

# Tutoría 8 - creada por el tutor

# Se crea con fechas futuras y luego se actualiza

creator = User.find_by!(email: "emilianodelgado@gmail.com")
course = Course.find_by(id: 443) # PIS
subject = course.subjects.sample(1).first

start_time = 5.days.from_now.change(hour: 13, min: 0) # concide con una de las tutoring availabilities

tutoring_offered_finished2 = Tutoring.find_or_create_by!(
  scheduled_at: start_time,
  modality: "virtual",
  capacity: 5,
  enrolled: 3,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id,
  duration_mins: 60,
  state: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered_finished2)

estudiante = User.find_by!(email: "arianarossi@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante,
  tutoring: tutoring_offered_finished2
)

estudiante2 = User.find_by!(email: "nicolasfunes@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante2,
  tutoring: tutoring_offered_finished2
)

estudiante3 = User.find_by!(email: "silvananavarro@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante3,
  tutoring: tutoring_offered_finished2
)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_finished2,
  start_time: 5.days.from_now.change(hour: 13, min: 0),
  end_time: 5.days.from_now.change(hour: 19, min: 0),
  is_booked: true
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered_finished2
)

# Actualizo a finalizada

tutoring_offered_finished2.state = 2
tutoring_offered_finished2.scheduled_at = 20.days.ago.change(hour: 13, min: 0)
tutoring_offered_finished2.duration_mins = 60
tutoring_offered_finished2.save!(validate: false)
# para que me deje poner una fecha del pasado aunque la db no lo permite

availability = TutoringAvailability.find_by(tutoring: tutoring_offered_finished2)
availability.update!(
  start_time: 20.days.ago.change(hour: 13, min: 0),
  end_time: 20.days.ago.change(hour: 19, min: 0)
)

# Para probar el ranking con feedback de tutoría pasadas
Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante.id,
                            tutoring_id: tutoring_offered_finished2.id,
                            rating: 1)

Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante2.id,
                            tutoring_id: tutoring_offered_finished2.id,
                            rating: 1)

Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante3.id,
                            tutoring_id: tutoring_offered_finished2.id,
                            rating: 5)

# Tutoría 9 - creada por estudiante

# Se crea con fechas futuras y luego se actualiza

creator = User.find_by!(email: "silvananavarro@gmail.com")
tutor = User.find_by!(email: "arianarossi@gmail.com")
course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
subject = course.subjects.sample(1).first

start_time = 15.days.from_now.change(hour: 13, min: 0) # concide con una de las tutoring availabilities

tutoring_requested_finished = Tutoring.find_or_create_by!(
  scheduled_at: start_time,
  modality: "virtual",
  capacity: 5,
  enrolled: 4,
  course: course,
  created_by_id: creator.id,
  tutor_id: tutor.id,
  duration_mins: 60,
  state: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_requested_finished)

estudiante = User.find_by!(email: "leonelpereyra@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante,
  tutoring: tutoring_requested_finished
)

estudiante2 = User.find_by!(email: "nicolasfunes@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante2,
  tutoring: tutoring_requested_finished
)

estudiante3 = User.find_by!(email: "patriciacabrera@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante3,
  tutoring: tutoring_requested_finished
)

estudiante4 = User.find_by!(email: "emilianodelgado@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante4,
  tutoring: tutoring_requested_finished
)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_requested_finished,
  start_time: 15.days.from_now.change(hour: 13, min: 0),
  end_time: 15.days.from_now.change(hour: 19, min: 0),
  is_booked: true
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: tutor,
  tutoring: tutoring_requested_finished
)

# Actualizo a finalizada

tutoring_requested_finished.state = 2
tutoring_requested_finished.scheduled_at = 10.days.ago.change(hour: 13, min: 0)
tutoring_requested_finished.duration_mins = 60
tutoring_requested_finished.save!(validate: false)
# para que me deje poner una fecha del pasado aunque la db no lo permite

availability = TutoringAvailability.find_by(tutoring: tutoring_requested_finished)
availability.update!(
  start_time: 10.days.ago.change(hour: 13, min: 0),
  end_time: 10.days.ago.change(hour: 19, min: 0)
)

# Para probar el ranking con feedback de tutoría pasadas
Feedback.find_or_create_by!(tutor_id: tutor.id,
                            student_id: estudiante.id,
                            tutoring_id: tutoring_requested_finished.id,
                            rating: 2)

Feedback.find_or_create_by!(tutor_id: tutor.id,
                            student_id: estudiante2.id,
                            tutoring_id: tutoring_requested_finished.id,
                            rating: 4)

Feedback.find_or_create_by!(tutor_id: tutor.id,
                            student_id: estudiante3.id,
                            tutoring_id: tutoring_requested_finished.id,
                            rating: 5)

Feedback.find_or_create_by!(tutor_id: tutor.id,
                            student_id: estudiante4.id,
                            tutoring_id: tutoring_requested_finished.id,
                            rating: 4.5)

# Tutoría 10 - creada por el tutor

# Se crea con fechas futuras y luego se actualiza

creator = User.find_by!(email: "brunoacosta@gmail.com")
course = Course.find_by(id: 39) # Cálculo Diferencial e Integral en una variable
subject = course.subjects.sample(1).first

start_time = 20.days.from_now.change(hour: 13, min: 0) # concide con una de las tutoring availabilities

tutoring_offered_finished3 = Tutoring.find_or_create_by!(
  scheduled_at: start_time,
  modality: "virtual",
  capacity: 4,
  enrolled: 3,
  course: course,
  created_by_id: creator.id,
  tutor_id: creator.id,
  duration_mins: 60,
  state: 1
)

SubjectTutoring.find_or_create_by!(subject: subject, tutoring: tutoring_offered_finished3)

estudiante = User.find_by!(email: "arianarossi@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante,
  tutoring: tutoring_offered_finished3
)

estudiante2 = User.find_by!(email: "nicolasfunes@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante2,
  tutoring: tutoring_offered_finished3
)

estudiante3 = User.find_by!(email: "silvananavarro@gmail.com")
UserTutoring.find_or_create_by!(
  user: estudiante3,
  tutoring: tutoring_offered_finished3
)

# Crear disponibilidades para esta tutoría
TutoringAvailability.find_or_create_by!(
  tutoring: tutoring_offered_finished3,
  start_time: 20.days.from_now.change(hour: 13, min: 0),
  end_time: 20.days.from_now.change(hour: 19, min: 0),
  is_booked: true
)

# BORRAR DESPUES
UserTutoring.find_or_create_by!(
  user: creator,
  tutoring: tutoring_offered_finished3
)

# Actualizo a finalizada

tutoring_offered_finished3.state = 2
tutoring_offered_finished3.scheduled_at = 11.days.ago.change(hour: 13, min: 0)
tutoring_offered_finished3.duration_mins = 60
tutoring_offered_finished3.save!(validate: false)
# para que me deje poner una fecha del pasado aunque la db no lo permite

availability = TutoringAvailability.find_by(tutoring: tutoring_offered_finished3)
availability.update!(
  start_time: 11.days.ago.change(hour: 13, min: 0),
  end_time: 11.days.ago.change(hour: 19, min: 0)
)

# Para probar el ranking con feedback de tutoría pasadas
Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante.id,
                            tutoring_id: tutoring_offered_finished3.id,
                            rating: 2)

Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante2.id,
                            tutoring_id: tutoring_offered_finished3.id,
                            rating: 2)

Feedback.find_or_create_by!(tutor_id: creator.id,
                            student_id: estudiante3.id,
                            tutoring_id: tutoring_offered_finished3.id,
                            rating: 5)
