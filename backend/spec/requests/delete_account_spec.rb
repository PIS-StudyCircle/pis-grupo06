require 'rails_helper'
require 'devise/jwt/test_helpers'

RSpec.describe "Eliminar cuenta", type: :request do
  let!(:universidad) { University.first || University.create!(name: "Universidad de Prueba") }
  let!(:facultad) { Faculty.first || Faculty.create!(name: "Facultad de Ingeniería", university: universidad) }

  let(:user) do
    User.create!(
      email: "pepe@gmail.com",
      password: "pepe1234",
      password_confirmation: "pepe1234",
      name: "Pepe",
      last_name: "Pepe",
      faculty: Faculty.first
    )
  end

  let(:other_user) do
    User.create!(
      email: "other@gmail.com",
      password: "other1234",
      password_confirmation: "other1234",
      name: "Other",
      last_name: "User",
      faculty: facultad
    )
  end

  let(:other_user2) do
    User.create!(
      email: "other2@gmail.com",
      password: "other1234",
      password_confirmation: "other1234",
      name: "Other",
      last_name: "User",
      faculty: facultad
    )
  end

  let(:base_headers) do
    { "ACCEPT" => "application/json", "CONTENT_TYPE" => "application/json" }
  end

  def successful_login
    post "/api/v1/users/sign_in",
         params: { api_v1_user: { email: user.email, password: user.password } },
         headers: base_headers,
         as: :json
    expect(response).to have_http_status(:ok)
    jwt = response.headers["Authorization"]
    expect(jwt).to be_present
    base_headers.merge("Authorization" => jwt)
  end

  it "no elimina si no está autenticado" do
    delete "/api/v1/users"
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
    get "/api/v1/users/me"
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
  end

  it "no elimina la cuenta si la contraseña es incorrecta" do
    headers = successful_login
    post "/api/v1/users/validate_password",
         params: { user: { password: "incorrecta" } },
         headers: headers,
         as: :json
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
    expect(response.parsed_body["error"]).to eq("La contraseña es incorrecta.")

    expect(User.find_by(id: user.id)).to be_present

    get "/api/v1/users/me", headers: headers
    expect(response).to have_http_status(:ok)
    json = response.parsed_body
    payload = json.dig("data", "user") || json["data"] || json["user"] || json
    expect(payload).to be_present
    expect(payload["email"]).to eq(user.email)
  end

  it "elimina la cuenta si la contraseña es correcta" do
    course = Course.create!(name: "Curso Especial", code: "CE1", faculty: facultad)
    subject = Subject.create!(name: "Tema 1", course: course, creator: user)

    # Tutoría donde el usuario crea la tutoría, es tutor y tiene estudiantes
    tutoring_created_as_tutor_with_student = Tutoring.create!(
      course_id: course.id,
      scheduled_at: 1.day.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      tutor_id: user.id,
      created_by_id: user.id,
      enrolled: 1,
      state: 1, # active
    )
    UserTutoring.create!(user: other_user, tutoring: tutoring_created_as_tutor_with_student)

    # Tutoría donde el usuario crea la tutoría, es tutor y no tiene estudiantes
    tutoring_created_as_tutor_without_student = Tutoring.create!(
      course_id: course.id,
      scheduled_at: 2.days.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      tutor_id: user.id,
      created_by_id: user.id,
      enrolled: 0,
      state: 1, # active
    )

    # Tutoría donde el usuario crea la tutoría, es estudiante y tiene estudiantes
    tutoring_created_as_student_with_student = Tutoring.create!(
      course_id: course.id,
      scheduled_at: 3.days.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      tutor_id: other_user.id,
      created_by_id: user.id,
      enrolled: 2,
      state: 1, # active
    )
    UserTutoring.create!(user: user, tutoring: tutoring_created_as_student_with_student)
    UserTutoring.create!(user: other_user2, tutoring: tutoring_created_as_student_with_student)

    # Tutoría donde el usuario crea la tutoría, es estudiante y tiene estudiantes
    tutoring_created_as_student_without_student = Tutoring.create!(
      course_id: course.id,
      scheduled_at: 4.days.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      tutor_id: other_user.id,
      created_by_id: user.id,
      enrolled: 1,
      state: 1, # active
    )
    UserTutoring.create!(user: user, tutoring: tutoring_created_as_student_without_student)

    # Tutoría donde el usuario crea la tutoría, es estudiante y no tiene tutor
    tutoring_created_as_student_without_tutor = Tutoring.create!(
      course_id: course.id,
      scheduled_at: 5.days.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      tutor_id: nil,
      created_by_id: user.id,
      enrolled: 1,
      state: 0, # pending
    )
    UserTutoring.create!(user: user, tutoring: tutoring_created_as_student_without_tutor)

    # Tutoría donde el usuario no crea la tutoría, es estudiante
    tutoring_as_student_with_student = Tutoring.create!(
      course_id: course.id,
      scheduled_at: 6.days.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      tutor_id: other_user.id,
      created_by_id: other_user.id,
      enrolled: 2,
      state: 1, # active
    )
    UserTutoring.create!(user: user, tutoring: tutoring_as_student_with_student)
    UserTutoring.create!(user: other_user2, tutoring: tutoring_as_student_with_student)

    # Tutoría donde el usuario no crea la tutoría, es estudiante, y no tiene estudiantes
    tutoring_as_student_without_student = Tutoring.create!(
      course_id: course.id,
      scheduled_at: 7.days.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      tutor_id: other_user.id,
      created_by_id: other_user.id,
      enrolled: 1,
      state: 1, # active
    )
    UserTutoring.create!(user: user, tutoring: tutoring_as_student_without_student)

    headers = successful_login
    post "/api/v1/users/validate_password",
         params: { user: { password: user.password } },
         headers: headers,
         as: :json
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["message"]).to eq("Contraseña válida.")
    expect do
      delete "/api/v1/users", headers: headers, as: :json
    end.to change(User, :count).by(-1)
    expect(response).to have_http_status(:ok)
    expect(User.find_by(id: user.id)).to be_nil
    expect(Subject.find_by(id: subject.id).creator_id).to be_nil
    expect(response.parsed_body["message"]).to eq("Tu cuenta ha sido eliminada con éxito.")

    get "/api/v1/users/me", headers: headers
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)

    expect(Tutoring.find_by(id: tutoring_created_as_tutor_with_student.id)).to be_nil 
    expect(Tutoring.find_by(id: tutoring_created_as_tutor_without_student.id)).to be_nil

    expect(Tutoring.find_by(id: tutoring_created_as_student_with_student.id).tutor_id)
      .to eq(other_user.id)
    expect(Tutoring.find_by(id: tutoring_created_as_student_with_student.id).created_by_id)
      .to be_nil
    expect(Tutoring.find_by(id: tutoring_created_as_student_with_student.id).state)
      .to eq("active")
    expect(Tutoring.find_by(id: tutoring_created_as_student_with_student.id).enrolled)
      .to eq(1)
    expect(UserTutoring.find_by(user_id: user.id, tutoring_id: tutoring_created_as_student_with_student.id))
      .to be_nil
    expect(UserTutoring.find_by(user_id: other_user2.id, tutoring_id: tutoring_created_as_student_with_student.id))
      .to be_present

    expect(Tutoring.find_by(id: tutoring_created_as_student_without_student.id)).to be_nil
    expect(UserTutoring.find_by(user_id: user.id, tutoring_id: tutoring_created_as_student_without_student.id))
      .to be_nil

    expect(Tutoring.find_by(id: tutoring_created_as_student_without_tutor.id)).to be_nil
    expect(UserTutoring.find_by(user_id: user.id, tutoring_id: tutoring_created_as_student_without_tutor.id)).to be_nil

    expect(Tutoring.find_by(id: tutoring_as_student_with_student.id).tutor_id).to eq(other_user.id)
    expect(Tutoring.find_by(id: tutoring_as_student_with_student.id).created_by_id).to eq(other_user.id)
    expect(Tutoring.find_by(id: tutoring_as_student_with_student.id).state).to eq("active")
    expect(Tutoring.find_by(id: tutoring_as_student_with_student.id).enrolled).to eq(1)
    expect(UserTutoring.find_by(user_id: user.id, tutoring_id: tutoring_as_student_with_student.id)).to be_nil
    expect(UserTutoring.find_by(user_id: other_user2.id, tutoring_id: tutoring_as_student_with_student.id))
      .to be_present

    expect(Tutoring.find_by(id: tutoring_as_student_without_student.id).tutor_id).to eq(other_user.id)
    expect(Tutoring.find_by(id: tutoring_as_student_without_student.id).created_by_id).to eq(other_user.id)
    expect(Tutoring.find_by(id: tutoring_as_student_without_student.id).state).to eq("active")
    expect(Tutoring.find_by(id: tutoring_as_student_without_student.id).enrolled).to eq(0)
    expect(UserTutoring.find_by(user_id: user.id, tutoring_id: tutoring_as_student_without_student.id)).to be_nil
  end
end
