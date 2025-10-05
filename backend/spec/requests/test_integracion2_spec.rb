# Flujo: Course → CourseDetail → Subject → SubjectDetail → CreateTutoringByTutor → TutoringPage
require "rails_helper"

RSpec.describe "Flow: Course → CourseDetail → Subject → SubjectDetail → CreateTutoringByTutor → TutoringPage",
               type: :request do
  include Devise::Test::IntegrationHelpers

  def ensure_faculty
    uni = University.find_or_create_by!(name: "Test University")
    Faculty.find_or_create_by!(name: "Test Faculty", university: uni)
  end

  def create_user(attrs = {})
    faculty = ensure_faculty
    defaults = {
      email: "tutor#{SecureRandom.hex(3)}@mail.test",
      password: "password123",
      password_confirmation: "password123",
      name: "Tu",
      last_name: "Tor",
      faculty: faculty,
      jti: SecureRandom.uuid
    }
    User.create!(defaults.merge(attrs))
  end

  def create_course(attrs = {})
    defaults = { name: "Course #{SecureRandom.hex(2)}", code: "C#{rand(1000..9999)}" }
    Course.create!(defaults.merge(attrs))
  end

  def parsed
    JSON.parse(response.body) rescue {}
  end

  def extract_courses(json)
    if json.is_a?(Hash) && json["courses"].is_a?(Array)
      json["courses"]
    elsif json.is_a?(Array)
      json
    else
      []
    end
  end

  def extract_tutorings(json)
    if json.is_a?(Hash) && json["tutorings"].is_a?(Array)
      json["tutorings"]
    elsif json.is_a?(Array)
      json
    else
      []
    end
  end

  it "Permite al tutor navegar curso, crear una tutoría y verla listada con filtros" do
    # Registro y login
    tutor = create_user
    sign_in tutor

    # Listar cursos
    get "/api/v1/courses"
    expect(response).to have_http_status(:ok)
    _courses = extract_courses(parsed) 

    # Crear un curso
    course = create_course(name: "Física I", code: "FIS101")

    # CourseDetailPage
    get "/api/v1/courses/#{course.id}"
    expect(response).to have_http_status(:ok)

    # Crear subject
    post "/api/v1/courses/#{course.id}/subjects",
         params: { subject: { name: "Movimiento Rectilíneo", course_id: course.id } }
    expect(response).to have_http_status(:created)
    subject_id = parsed["id"]

    # Listar subjects del curso
    get "/api/v1/courses/#{course.id}/subjects"
    expect(response).to have_http_status(:ok)
    subjects_payload = parsed
    expect(subjects_payload).to be_a(Hash)
    expect(subjects_payload["subjects"]).to be_a(Array)
    expect(subjects_payload["subjects"].map { |s| s["id"] }).to include(subject_id)

    # SubjectDetailPage
    get "/api/v1/courses/#{course.id}/subjects/#{subject_id}"
    expect(response).to have_http_status(:ok)
    expect(parsed["data"]).to include("id" => subject_id) if parsed["data"].is_a?(Hash)

    # Crear tutoría como tutor
    post "/api/v1/tutorings",
         params: {
           tutoring: {
             scheduled_at: 3.days.from_now,
             duration_mins: 90,
             modality: "presencial",
             capacity: 4,
             course_id: course.id,
             created_by_id: tutor.id,
             tutor_id: tutor.id
           },
           subject_ids: [subject_id]
         }
    expect(response).to have_http_status(:created)
    tutoring_id = parsed["id"] || Tutoring.last.id

    # Filtrar por course_id
    get "/api/v1/tutorings", params: { course_id: course.id }
    expect(response).to have_http_status(:ok)
    tuts = extract_tutorings(parsed)
    expect(tuts.map { |t| t["id"] }).to include(tutoring_id)

    # Filtrar por mis tutorías creadas
    get "/api/v1/tutorings", params: { created_by_user: tutor.id }
    expect(response).to have_http_status(:ok)
    tuts = extract_tutorings(parsed)
    expect(tuts.map { |t| t["id"] }).to include(tutoring_id)
  end
end
