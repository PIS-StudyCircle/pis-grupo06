# Flujo: Registro → Crear tutoría (estudiante) → Listado → Perfil → Mis tutorías
require "rails_helper"

RSpec.describe "Flow: Registro → Crear tutoría (estudiante) → Listado → Perfil → Mis tutorías", type: :request do
  include Devise::Test::IntegrationHelpers

  def ensure_faculty
    uni = University.find_or_create_by!(name: "Test University")
    Faculty.find_or_create_by!(name: "Test Faculty", university: uni)
  end

  def create_user(attrs = {})
    faculty = ensure_faculty
    defaults = {
      email: "student#{SecureRandom.hex(3)}@mail.test",
      password: "password123",
      password_confirmation: "password123",
      name: "Ana",
      last_name: "Perez",
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
    response.parsed_body rescue {}
  end

  def tutorings_ids!
    expect(parsed).to be_a(Hash)
    expect(parsed["tutorings"]).to be_a(Array)
    parsed["tutorings"].map { |t| t["id"] }
  end

  it "permite a un estudiante registrarse, crear materias del curso, crear tutoría y consultarla" do
    # Registro y login
    user = create_user
    sign_in user

    # Crear curso
    course = create_course(name: "Álgebra", code: "ALG101")

    # Crear Subjects
    post "/api/v1/courses/#{course.id}/subjects",
         params: { subject: { name: "Vectores", course_id: course.id } }
    expect(response).to have_http_status(:created)
    s1_id = parsed["id"]

    post "/api/v1/courses/#{course.id}/subjects",
         params: { subject: { name: "Matrices", course_id: course.id } }
    expect(response).to have_http_status(:created)
    parsed["id"]

    # Crear tutoría como estudiante
    post "/api/v1/tutorings",
         params: {
           tutoring: {
             scheduled_at: 2.days.from_now,
             duration_mins: 60,
             modality: "virtual",
             capacity: 3,
             course_id: course.id,
             created_by_id: user.id,
             tutor_id: nil
           },
           subject_ids: [s1_id]
         }
    expect(response).to have_http_status(:created)
    tutoring_id = parsed["id"] || Tutoring.last.id

    # Listado general con la tutoría recién creada
    get "/api/v1/tutorings", params: {}
    expect(response).to have_http_status(:ok)
    expect(tutorings_ids!).to include(tutoring_id)
    expect(parsed["pagination"]).to include("page", "last")

    # Mis tutorías creadas por mí
    get "/api/v1/tutorings", params: { created_by_user: user.id }
    expect(response).to have_http_status(:ok)
    expect(tutorings_ids!).to include(tutoring_id)

    # Mis tutorías por inscripción
    UserTutoring.create!(user: user, tutoring_id: tutoring_id)
    get "/api/v1/tutorings", params: { enrolled: true }
    expect(response).to have_http_status(:ok)
    expect(tutorings_ids!).to include(tutoring_id)
  end
end
