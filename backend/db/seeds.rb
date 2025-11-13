# db/seeds.rb
# =============================================================================
# SEED FILE - StudyCircle Application
# =============================================================================
# This seed file creates a complete testing environment with users, courses,
# subjects, tutorings (active, pending, finished), reviews, and feedbacks.
# All data is logically consistent and follows application validations.
# =============================================================================

require 'securerandom'

Rails.logger.debug "Starting seed process..."

# =============================================================================
# UNIVERSITY AND FACULTY
# =============================================================================

Rails.logger.debug "\n[1/7] Creating University and Faculty..."

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

# =============================================================================
# USERS (9 users as specified)
# =============================================================================

Rails.logger.debug "[2/7] Creating 9 users..."

users_data = [
  { name: "Ana", last_name: "Pérez", email: "anaperez@gmail.com" },
  { name: "Luis", last_name: "Gómez", email: "luisgomez@gmail.com" },
  { name: "María", last_name: "Rodríguez", email: "mariarodriguez@gmail.com" },
  { name: "Juan", last_name: "López", email: "juanlopez@gmail.com" },
  { name: "Sofía", last_name: "García", email: "sofiagarcia@gmail.com" },
  { name: "Diego", last_name: "Martínez", email: "diegomartinez@gmail.com" },
  { name: "Laura", last_name: "Fernández", email: "laurafernandez@gmail.com" },
  { name: "Carlos", last_name: "Silva", email: "carlossilva@gmail.com" },
  { name: "Valentina", last_name: "Torres", email: "valentinatorres@gmail.com" }
]

users = []
users_data.each do |user_data|
  user = User.find_or_create_by!(email: user_data[:email]) do |u|
    u.name = user_data[:name]
    u.last_name = user_data[:last_name]
    u.faculty = fing
    u.password = "password123"
    u.password_confirmation = "password123"
    u.description = "Estudiante de prueba"
    u.jti = SecureRandom.uuid
  end
  users << user
end

# Assign to variables for easy reference
user1, user2, user3, user4, user5, user6, user7, user8, user9 = users

Rails.logger.debug { "  Created #{users.count} users" }

# =============================================================================
# COURSES AND SUBJECTS (10 courses, first 7 with 2-7 subjects each)
# =============================================================================

Rails.logger.debug "[3/7] Creating 10 courses with subjects..."

# Course 1: Programación I (7 subjects)
course1 = Course.find_or_create_by!(
  name: "Programación 1",
  code: "1373",
  institute: "INCO",
  faculty: fing
)

%w[Variables Bucles Funciones Arrays Recursión POO Archivos].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course1) do |s|
    s.creator = user1
    s.due_date = 3.months.from_now
  end
end

# Course 2: Cálculo Diferencial (5 subjects)
course2 = Course.find_or_create_by!(
  name: "Cálculo Diferencial e Integral en una variable",
  faculty: fing
)

%w[Límites Derivadas Integrales Series Funciones].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course2) do |s|
    s.creator = user2
    s.due_date = 3.months.from_now
  end
end

# Course 3: Física I (4 subjects)
course3 = Course.find_or_create_by!(
  name: "Física 1",
  institute: "IF",
  faculty: fing
)

%w[Cinemática Dinámica Energía Momentum].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course3) do |s|
    s.creator = user3
    s.due_date = 3.months.from_now
  end
end

# Course 4: Álgebra Lineal (6 subjects)
course4 = Course.find_or_create_by!(
  name: "Geometría y Álgebra Lineal 1",
  institute: "IMERL",
  faculty: fing
)

%w[Matrices Vectores Determinantes Autovalores Diagonalización Espacios].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course4) do |s|
    s.creator = user4
    s.due_date = 3.months.from_now
  end
end

# Course 5: Estructuras de Datos (3 subjects)
course5 = Course.find_or_create_by!(
  name: "Estructuras de Datos",
  code: "ESTDAT",
  institute: "Instituto de Computación",
  faculty: fing
)

%w[Listas Árboles Grafos].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course5) do |s|
    s.creator = user5
    s.due_date = 3.months.from_now
  end
end

# Course 6: Bases de Datos (2 subjects)
course6 = Course.find_or_create_by!(
  name: "Bases de Datos 1",
  faculty: fing
)

%w[SQL Normalización].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course6) do |s|
    s.creator = user6
    s.due_date = 3.months.from_now
  end
end

# Course 7: Redes de Computadoras (4 subjects)
course7 = Course.find_or_create_by!(
  name: "Redes de Computadoras",
  code: "1446",
  institute: "INCO",
  faculty: fing
)

%w[TCP/IP HTTP DNS Routing].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course7) do |s|
    s.creator = user7
    s.due_date = 3.months.from_now
  end
end

# Course 8: Sistemas Operativos (no subjects needed for pending tutorings)
course8 = Course.find_or_create_by!(
  name: "Sistemas Operativos",
  code: "1537",
  institute: "INCO",
  faculty: fing
)

%w[Procesos Memoria Archivos].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course8) do |s|
    s.creator = user8
    s.due_date = 3.months.from_now
  end
end

# Course 9: Ingeniería de Software (no subjects needed)
course9 = Course.find_or_create_by!(
  name: "Ingeniería de Software",
  code: "INGSOFT",
  institute: "Instituto de Computación",
  faculty: fing
)

%w[Requerimientos Testing Arquitectura].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course9) do |s|
    s.creator = user9
    s.due_date = 3.months.from_now
  end
end

# Course 10: Arquitectura de Computadores (no subjects needed)
course10 = Course.find_or_create_by!(
  name: "Arquitectura de Computadoras",
  code: "1466",
  institute: "INCO",
  faculty: fing
)

%w[CPU Pipeline Cache].each do |topic|
  Subject.find_or_create_by!(name: topic, course: course10) do |s|
    s.creator = user1
    s.due_date = 3.months.from_now
  end
end

Rails.logger.debug "  Created 10 courses with subjects"

# =============================================================================
# ACTIVE TUTORINGS (12 total: state = 'active')
# - 2 from course1, 3 from course2, 3 from course3, 2 from course4, 2 from course5
# - 4 created by tutor, 8 created by student
# - Each has 2-5 attendees (UserTutoring records)
# - At least 1 TutoringAvailability (one booked, rest unbooked)
# =============================================================================

Rails.logger.debug "[4/7] Creating 12 active tutorings..."

# Helper method to create a tutoring with attendees and availability
def create_active_tutoring(course:, tutor:, creator:, num_attendees:, subjects_count:, users_pool:)
  subjects = course.subjects.sample(subjects_count)

  tutoring = Tutoring.create!(
    course: course,
    tutor: tutor,
    created_by_id: creator.id,
    state: :active,
    modality: ["virtual", "presencial"].sample,
    duration_mins: [60, 90, 120].sample,
    capacity: num_attendees + 2,
    scheduled_at: (15 + rand(30)).days.from_now
  )

  # Link subjects
  subjects.each { |subject| SubjectTutoring.create!(subject: subject, tutoring: tutoring) }

  pool = users_pool.reject { |u| u.id == tutoring.tutor_id }

  # Si el creador no es el tutor, lo agregamos como asistente y reducimos la cuenta
  if creator.id != tutor.id
    UserTutoring.create!(user: creator, tutoring: tutoring)
    pool = pool.reject { |u| u.id == creator.id }
    num_attendees -= 1
  end

  # Create UserTutoring para los demás asistentes
  attendees = pool.sample(num_attendees)
  attendees.each { |attendee| UserTutoring.create!(user: attendee, tutoring: tutoring) }

  # Create TutoringAvailability (one booked, rest unbooked)
  num_availabilities = rand(1..3)
  num_availabilities.times do |i|
    TutoringAvailability.create!(
      tutoring: tutoring,
      start_time: tutoring.scheduled_at + i.hours,
      end_time: tutoring.scheduled_at + i.hours + tutoring.duration_mins.minutes,
      is_booked: (i == 0) # First one is booked
    )
  end

  # Create chat and welcome message
  tutoring.create_chat! unless tutoring.chat

  tutoring.chat.users << tutor unless tutoring.chat.users.exists?(tutor.id)
  if creator.id != tutor.id
    tutoring.chat.users << creator unless tutoring.chat.users.exists?(creator.id)
  end
  attendees.each do |u|
    tutoring.chat.users << u unless tutoring.chat.users.exists?(u.id)
  end

  if tutoring.chat.messages.count.zero?
    tutoring.chat.messages.create!(
      user: creator,
      content: "Bienvenidos al chat de la tutoría. Cualquier duda escriban aquí."
    )
  end

  tutoring
end

# Course 1: 2 tutorings (1 by tutor, 1 by student)
create_active_tutoring(course: course1, tutor: user1, creator: user1, num_attendees: 3, subjects_count: 2,
                       users_pool: users)
create_active_tutoring(course: course1, tutor: user2, creator: user3, num_attendees: 4, subjects_count: 3,
                       users_pool: users)

# Course 2: 3 tutorings (1 by tutor, 2 by student)
create_active_tutoring(course: course2, tutor: user3, creator: user3, num_attendees: 2, subjects_count: 2,
                       users_pool: users)
create_active_tutoring(course: course2, tutor: user4, creator: user5, num_attendees: 5, subjects_count: 3,
                       users_pool: users)
create_active_tutoring(course: course2, tutor: user5, creator: user6, num_attendees: 3, subjects_count: 2,
                       users_pool: users)

# Course 3: 3 tutorings (1 by tutor, 2 by student)
create_active_tutoring(course: course3, tutor: user6, creator: user6, num_attendees: 4, subjects_count: 2,
                       users_pool: users)
create_active_tutoring(course: course3, tutor: user7, creator: user8, num_attendees: 3, subjects_count: 3,
                       users_pool: users)
create_active_tutoring(course: course3, tutor: user8, creator: user9, num_attendees: 2, subjects_count: 2,
                       users_pool: users)

# Course 4: 2 tutorings (0 by tutor, 2 by student)
create_active_tutoring(course: course4, tutor: user9, creator: user1, num_attendees: 5, subjects_count: 3,
                       users_pool: users)
create_active_tutoring(course: course4, tutor: user1, creator: user2, num_attendees: 4, subjects_count: 4,
                       users_pool: users)

# Course 5: 2 tutorings (1 by tutor, 1 by student)
create_active_tutoring(course: course5, tutor: user2, creator: user2, num_attendees: 3, subjects_count: 2,
                       users_pool: users)
create_active_tutoring(course: course5, tutor: user3, creator: user4, num_attendees: 2, subjects_count: 2,
                       users_pool: users)

Rails.logger.debug "  Created 12 active tutorings"

# =============================================================================
# PENDING TUTORINGS (10 total: state = 'pending')
# - 2 from each of course4-course8
# - 5 created by tutor, 5 created by student
# - At least 1 TutoringAvailability (all unbooked, all future)
# =============================================================================

Rails.logger.debug "[5/7] Creating 10 pending tutorings..."

def create_pending_tutoring(course:, creator:, is_tutor_creator:)
  subjects = course.subjects.sample(rand(1..3))

  if is_tutor_creator
    tutoring = Tutoring.create!(
      course: course,
      tutor: creator,
      created_by_id: creator.id,
      state: :pending,
      modality: ["virtual", "presencial"].sample,
      duration_mins: [60, 90, 120].sample,
      scheduled_at: (15 + rand(30)).days.from_now,
      capacity: 2,
    )

    # Create TutoringAvailability (one booked, rest unbooked)
    num_availabilities = rand(1..3)
    num_availabilities.times do |i|
      TutoringAvailability.create!(
        tutoring: tutoring,
        start_time: tutoring.scheduled_at + i.hours,
        end_time: tutoring.scheduled_at + i.hours + tutoring.duration_mins.minutes,
        is_booked: (i == 0) # First one is booked
      )
    end
  else
    tutoring = Tutoring.create!(
      course: course,
      tutor: nil,
      created_by_id: creator.id,
      state: :pending,
      modality: ["virtual", "presencial"].sample,
      duration_mins: 1,
    )
    # If created by student, they get a UserTutoring
    UserTutoring.create!(user: creator, tutoring: tutoring) unless is_tutor_creator

    # Create TutoringAvailability (all unbooked)
    num_availabilities = rand(1..3)
    num_availabilities.times do |i|
      start_time = Time.current.beginning_of_day + (i + 1).days      # mañana + i días
      end_time = start_time + 16.hours                               # hasta las 16:00

      TutoringAvailability.create!(
        tutoring: tutoring,
        start_time: start_time,
        end_time: end_time,
        is_booked: false
      )
    end
  end

  # Link subjects
  subjects.each { |subject| SubjectTutoring.create!(subject: subject, tutoring: tutoring) }

  tutoring
end

# Course 4: 2 pending (1 by tutor, 1 by student)
create_pending_tutoring(course: course4, creator: user4, is_tutor_creator: true)
create_pending_tutoring(course: course4, creator: user5, is_tutor_creator: false)

# Course 5: 2 pending (1 by tutor, 1 by student)
create_pending_tutoring(course: course5, creator: user6, is_tutor_creator: true)
create_pending_tutoring(course: course5, creator: user7, is_tutor_creator: false)

# Course 6: 2 pending (1 by tutor, 1 by student)
create_pending_tutoring(course: course6, creator: user8, is_tutor_creator: true)
create_pending_tutoring(course: course6, creator: user9, is_tutor_creator: false)

# Course 7: 2 pending (1 by tutor, 1 by student)
create_pending_tutoring(course: course7, creator: user1, is_tutor_creator: true)
create_pending_tutoring(course: course7, creator: user2, is_tutor_creator: false)

# Course 8: 2 pending (1 by tutor, 1 by student)
create_pending_tutoring(course: course8, creator: user3, is_tutor_creator: true)
create_pending_tutoring(course: course8, creator: user4, is_tutor_creator: false)

Rails.logger.debug "  Created 10 pending tutorings"

# =============================================================================
# FINISHED TUTORINGS (10 total: state = 'finished')
# - 2 from each of course6-course10
# - 5 created by tutor, 5 created by student
# - At least 1 TutoringAvailability (one booked in past, rest unbooked)
# =============================================================================

Rails.logger.debug "[6/7] Creating 10 finished tutorings..."

def create_finished_tutoring(course:, tutor:, creator:, num_attendees:, subjects_count:, users_pool:)
  subjects = course.subjects.sample(subjects_count)

  # Create with future date first (to pass validation)
  tutoring = Tutoring.create!(
    course: course,
    tutor: tutor,
    created_by_id: creator.id,
    state: :active,
    modality: ["virtual", "presencial"].sample,
    duration_mins: [60, 90, 120].sample,
    capacity: num_attendees + 2,
    scheduled_at: 1.day.from_now
  )

  # Link subjects
  subjects.each { |subject| SubjectTutoring.create!(subject: subject, tutoring: tutoring) }

  # Create UserTutoring for attendees (NOT for tutor)
  attendees = users_pool.reject { |u| u.id == tutor.id }.sample(num_attendees)
  attendees.each { |attendee| UserTutoring.create!(user: attendee, tutoring: tutoring) }

  # Create TutoringAvailability (one booked in past, rest unbooked)
  past_date = (15 + rand(30)).days.ago

  TutoringAvailability.create!(
    tutoring: tutoring,
    start_time: past_date,
    end_time: past_date + tutoring.duration_mins.minutes,
    is_booked: true
  )

  # Additional unbooked availabilities
  rand(0..2).times do |i|
    TutoringAvailability.create!(
      tutoring: tutoring,
      start_time: past_date + (i + 1).hours,
      end_time: past_date + (i + 1).hours + tutoring.duration_mins.minutes,
      is_booked: false
    )
  end

  # Now update to finished state with past date (skip validation)
  tutoring.state = :finished
  tutoring.scheduled_at = past_date
  tutoring.save!(validate: false)

  tutor.increment(:tutorias_dadas_count)
  tutor.save!

  for user in users_pool
    user.increment(:tutorias_recibidas_count)
    user.save!
  end

  tutoring
end

# Course 6: 2 finished (1 by tutor, 1 by student)
t1 = create_finished_tutoring(course: course6, tutor: user5, creator: user5, num_attendees: 3, subjects_count: 2,
                              users_pool: users)

t2 = create_finished_tutoring(course: course6, tutor: user6, creator: user7, num_attendees: 2, subjects_count: 2,
                              users_pool: users)

# Course 7: 2 finished (1 by tutor, 1 by student)
t3 = create_finished_tutoring(course: course7, tutor: user7, creator: user7, num_attendees: 4, subjects_count: 2,
                              users_pool: users)
t4 = create_finished_tutoring(course: course7, tutor: user8, creator: user9, num_attendees: 3, subjects_count: 3,
                              users_pool: users)

# Course 8: 2 finished (1 by tutor, 1 by student)
t5 = create_finished_tutoring(course: course8, tutor: user9, creator: user9, num_attendees: 2, subjects_count: 2,
                              users_pool: users)
t6 = create_finished_tutoring(course: course8, tutor: user1, creator: user2, num_attendees: 3, subjects_count: 2,
                              users_pool: users)

# Course 9: 2 finished (1 by tutor, 1 by student)
t7 = create_finished_tutoring(course: course9, tutor: user2, creator: user2, num_attendees: 4, subjects_count: 2,
                              users_pool: users)
t8 = create_finished_tutoring(course: course9, tutor: user3, creator: user4, num_attendees: 2, subjects_count: 2,
                              users_pool: users)

# Course 10: 2 finished (1 by tutor, 1 by student)
t9 = create_finished_tutoring(course: course10, tutor: user4, creator: user4, num_attendees: 3, subjects_count: 2,
                              users_pool: users)
t10 = create_finished_tutoring(course: course10, tutor: user5, creator: user6, num_attendees: 2, subjects_count: 2,
                               users_pool: users)

# Store finished tutorings for reviews/feedbacks
[t1, t2, t3, t4, t5, t6, t7, t8, t9, t10]

Rails.logger.debug "  Created 10 finished tutorings"

# =============================================================================
# REVIEWS (3 total)
# - Each relates to a finished tutoring
# - Between tutor and attendee OR between two attendees
# =============================================================================

Rails.logger.debug "[7/7] Creating 3 reviews and 5 feedbacks..."

# Review 1: Between tutor and attendee of t1
tutor_t1 = t1.tutor
attendee_t1 = t1.user_tutorings.first.user
UserReview.create!(
  reviewer: attendee_t1,
  reviewed: tutor_t1,
  review: "Excelente tutor, explicó muy bien los conceptos de SQL y normalización."
)

attendee_t1.increment(:resenas_dadas_count)
attendee_t1.save!

# Review 2: Between two attendees of t3
attendees_t3 = t3.user_tutorings.limit(2).map(&:user)
if attendees_t3.size >= 2
  UserReview.create!(
    reviewer: attendees_t3[0],
    reviewed: attendees_t3[1],
    review: "Gran compañero de estudio, muy colaborativo durante la tutoría."
  )
end

attendees_t3[0].increment(:resenas_dadas_count)
attendees_t3[0].save!

# Review 3: Between tutor and attendee of t7
tutor_t7 = t7.tutor
attendee_t7 = t7.user_tutorings.first.user
UserReview.create!(
  reviewer: attendee_t7,
  reviewed: tutor_t7,
  review: "Muy clara la explicación sobre requerimientos y testing. Recomendado."
)

attendee_t7.increment(:resenas_dadas_count)
attendee_t7.save!

Rails.logger.debug "  Created 3 reviews"

# =============================================================================
# FEEDBACKS (5 total)
# - Each from student to tutor of a finished tutoring
# - Student must have UserTutoring for that tutoring
# =============================================================================

# Feedback 1: From attendee to tutor of t1
Feedback.create!(
  student: t1.user_tutorings.first.user,
  tutor: t1.tutor,
  tutoring: t1,
  rating: 5.0
)

t1.user_tutorings.first.user.increment(:feedback_dado_count)
t1.user_tutorings.first.user.save!

# Feedback 2: From attendee to tutor of t2
Feedback.create!(
  student: t2.user_tutorings.first.user,
  tutor: t2.tutor,
  tutoring: t2,
  rating: 4.5
)

t2.user_tutorings.first.user.increment(:feedback_dado_count)
t2.user_tutorings.first.user.save!

# Feedback 3: From attendee to tutor of t4
Feedback.create!(
  student: t4.user_tutorings.first.user,
  tutor: t4.tutor,
  tutoring: t4,
  rating: 4.0
)

t4.user_tutorings.first.user.increment(:feedback_dado_count)
t4.user_tutorings.first.user.save!

# Feedback 4: From attendee to tutor of t6
Feedback.create!(
  student: t6.user_tutorings.first.user,
  tutor: t6.tutor,
  tutoring: t6,
  rating: 5.0
)

t6.user_tutorings.first.user.increment(:feedback_dado_count)
t6.user_tutorings.first.user.save!

# Feedback 5: From attendee to tutor of t9
Feedback.create!(
  student: t9.user_tutorings.first.user,
  tutor: t9.tutor,
  tutoring: t9,
  rating: 3.5
)

t9.user_tutorings.first.user.increment(:feedback_dado_count)
t9.user_tutorings.first.user.save!

Rails.logger.debug "  Created 5 feedbacks"

# =============================================================================
# SUMMARY
# =============================================================================

Rails.logger.debug "\n" + ("=" * 80)
Rails.logger.debug "SEED COMPLETED SUCCESSFULLY!"
Rails.logger.debug "=" * 80
Rails.logger.debug { "Users: #{User.count}" }
Rails.logger.debug { "Courses: #{Course.count}" }
Rails.logger.debug { "Subjects: #{Subject.count}" }
Rails.logger.debug "Tutorings:"
Rails.logger.debug { "  - Active: #{Tutoring.where(state: :active).count}" }
Rails.logger.debug { "  - Pending: #{Tutoring.where(state: :pending).count}" }
Rails.logger.debug { "  - Finished: #{Tutoring.where(state: :finished).count}" }
Rails.logger.debug { "  - Total: #{Tutoring.count}" }
Rails.logger.debug { "TutoringAvailabilities: #{TutoringAvailability.count}" }
Rails.logger.debug { "UserTutorings: #{UserTutoring.count}" }
Rails.logger.debug { "Reviews: #{UserReview.count}" }
Rails.logger.debug { "Feedbacks: #{Feedback.count}" }
