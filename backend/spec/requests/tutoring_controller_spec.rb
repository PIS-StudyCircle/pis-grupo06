require "rails_helper"

RSpec.describe "Api::V1::TutoringsController", type: :request do
  include Devise::Test::IntegrationHelpers

  let!(:university) { University.create!(name: "Universidad de la República") }
  let!(:faculty)    { Faculty.create!(name: "Facultad de Ingeniería", university: university) }
  let!(:course)     { Course.create!(name: "Álgebra", faculty: faculty) }

  let!(:tutor) do
    User.create!(
      name: "Tutor",
      last_name: "Prueba",
      email: "tutor@example.com",
      password: "password123",
      password_confirmation: "password123",
      google_access_token: "token123",
      calendar_id: "cal_2",
      faculty: faculty
    )
  end

  let!(:user) do
    User.create!(
      name: "Juan",
      last_name: "Pérez",
      email: "test@example.com",
      password: "password123",
      password_confirmation: "password123",
      google_access_token: "token123",
      calendar_id: "cal_1",
      faculty: faculty
    )
  end

  let!(:tutoring) do
    Tutoring.create!(
      tutor: tutor,
      course: course,
      scheduled_at: 1.day.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      event_id: "evt_123"
    )
  end

  before do
    sign_in user
    allow_any_instance_of(GoogleCalendarService).to receive(:create_event)
    allow_any_instance_of(GoogleCalendarService).to receive(:join_event)
  end

  describe "GET #index" do
    it "devuelve tutorías con paginación" do
      get api_v1_tutorings_path
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["tutorings"]).to be_an(Array)
    end

    it "filtra por course_id" do
      other_course = Course.create!(name: "Cálculo", faculty: faculty)
      tutoring2 = Tutoring.create!(course: other_course, tutor: user, scheduled_at: 1.day.from_now, duration_mins: 60,
                                   modality: "virtual",
                                   capacity: 5)

      get api_v1_tutorings_path, params: { course_id: course.id }
      ids = response.parsed_body["tutorings"].pluck("id")
      expect(ids).to include(tutoring.id)
      expect(ids).not_to include(tutoring2.id)
    end

    it "filtra por tutor asignado" do
      get api_v1_tutorings_path, params: { with_tutor: true }
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["tutorings"].all? { |t| !t["tutor_id"].nil? }).to be true
    end

    it "filtra por tutorías sin tutor" do
      tutoring.update!(tutor: nil)
      get api_v1_tutorings_path, params: { without_tutor: true }
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["tutorings"].all? { |t| t["tutor_id"].nil? }).to be true
    end
  end

  describe "POST #join_tutoring" do
    it "inscribe al estudiante y aumenta enrolled" do
      expect {
        post join_tutoring_api_v1_tutoring_path(tutoring.id)
      }.to change { tutoring.reload.enrolled }.by(1)

      expect(response).to have_http_status(:created)
      expect(UserTutoring.exists?(user: user, tutoring: tutoring)).to be true
    end

    it "no permite inscribirse dos veces" do
      UserTutoring.create!(user: user, tutoring: tutoring)
      post join_tutoring_api_v1_tutoring_path(tutoring.id)
      expect(response).to have_http_status(:conflict)
      expect(response.parsed_body["error"]).to eq("Ya perteneces a esta tutoría.")
    end

    it "no permite inscribirse si está llena" do
      tutoring.update!(capacity: 0)
      post join_tutoring_api_v1_tutoring_path(tutoring.id)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "sigue inscribiendo aunque falle Google Calendar" do
      allow_any_instance_of(GoogleCalendarService).to receive(:join_event).and_raise("Boom")
      expect {
        post join_tutoring_api_v1_tutoring_path(tutoring.id)
      }.to change { UserTutoring.count }.by(1)
      expect(response).to have_http_status(:created)
    end
  end

  describe "POST #confirm_schedule" do
    let(:scheduled_time) { 1.day.from_now.change(hour: 10, min: 0) }

    before do
      tutoring.tutoring_availabilities.create!(
        start_time: scheduled_time - 1.hour,
        end_time: scheduled_time + 2.hours,
        is_booked: false
      )
    end

    it "devuelve error si el rol no es 'student' ni 'tutor'" do
      post confirm_schedule_api_v1_tutoring_path(tutoring.id),
           params: { scheduled_at: scheduled_time, role: "invalid" }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("Debe especificar el rol")
    end

    it "devuelve error si el horario no está dentro de las disponibilidades" do
      post confirm_schedule_api_v1_tutoring_path(tutoring.id),
           params: { scheduled_at: scheduled_time - 2.hours, role: "student" }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("no está dentro de las disponibilidades")
    end

    it "devuelve error si la tutoría está llena" do
      availability = tutoring.tutoring_availabilities.first
      scheduled_time = availability.start_time + 30.minutes

      tutoring.capacity.times do |i|
        student = User.create!(
          name: "Estudiante #{i}",
          last_name: "Test",
          email: "estudiante#{i}@mail.com",
          password: "password123",
          password_confirmation: "password123",
          faculty: tutoring.course.faculty
        )
        UserTutoring.create!(user: student, tutoring: tutoring)
      end

      post confirm_schedule_api_v1_tutoring_path(tutoring.id),
           params: { scheduled_at: scheduled_time, role: "student" }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("capacidad máxima")
    end

    it "no permite inscribirse dos veces" do
      UserTutoring.create!(user: user, tutoring: tutoring)
      post confirm_schedule_api_v1_tutoring_path(tutoring.id),
           params: { scheduled_at: scheduled_time, role: "student" }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("Ya estás inscrito")
    end

    it "confirma el horario y se inscribe correctamente como estudiante" do
      expect {
        post confirm_schedule_api_v1_tutoring_path(tutoring.id),
             params: { scheduled_at: scheduled_time, role: "student" }
      }.to change { tutoring.reload.enrolled }.by(1)
      expect(response).to have_http_status(:ok)
      expect(UserTutoring.exists?(user: user, tutoring: tutoring)).to be true
    end

    it "confirma el horario y asigna tutor correctamente" do
      tutoring.update!(tutor_id: nil)
      expect {
        post confirm_schedule_api_v1_tutoring_path(tutoring.id),
             params: { scheduled_at: scheduled_time, role: "tutor" }
      }.to change { UserTutoring.count }.by(0)
      expect(tutoring.reload.tutor_id).to eq(user.id)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET #show" do
    it "devuelve la tutoría con sus atributos y disponibilidades" do
      tutoring_with_creator = Tutoring.create!(
        course: course,
        creator: user,
        tutor_id: tutor.id,
        capacity: 3,
        enrolled: 1,
        modality: "virtual",
        duration_mins: 60,
        state: "pending"
      )

      availability = TutoringAvailability.create!(
        tutoring: tutoring_with_creator,
        start_time: 1.hour.from_now,
        end_time: 2.hours.from_now,
        is_booked: false
      )

      get api_v1_tutoring_path(tutoring_with_creator.id)

      expect(response).to have_http_status(:ok)
      json = response.parsed_body

      expect(json["id"]).to eq(tutoring_with_creator.id)
      expect(json["course"]["name"]).to eq(course.name)
      expect(json["created_by"]["name"]).to eq(user.name)
      expect(json["tutor"]["name"]).to eq(tutor.name)
      expect(json["availabilities"].first["id"]).to eq(availability.id)
    end
  end

  describe "POST #create" do
    let(:params) do
      {
        tutoring: {
          course_id: course.id,
          tutor_id: tutor.id,
          capacity: 2,
          modality: "virtual",
          duration_mins: 60,
          availabilities_attributes: [
            { start_time: 1.hour.from_now, end_time: 2.hours.from_now }
          ]
        }
      }
    end

    it "crea la tutoría correctamente con disponibilidades" do
      expect {
        post api_v1_tutorings_path, params: params
      }.to change { Tutoring.count }.by(1)
                                    .and change { TutoringAvailability.count }.by(1)

      expect(response).to have_http_status(:created)
      body = response.parsed_body
      expect(body["tutoring"]["availabilities"].length).to eq(1)
    end

    it "devuelve error si hay overlapping con otra tutoría del usuario" do
      allow_any_instance_of(Api::V1::TutoringsController)
        .to receive(:availability_overlaps?).and_return(true)

      post api_v1_tutorings_path, params: params

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"].first).to include("Ya tienes una tutoría programada")
    end
  end

  describe "PUT #update" do
    it "actualiza la tutoría correctamente" do
      original_capacity = tutoring.capacity

      put api_v1_tutoring_path(tutoring.id),
          params: { tutoring: { capacity: original_capacity + 1 } }

      expect(response).to have_http_status(:ok)
      expect(tutoring.reload.capacity).to eq(original_capacity + 1)
      expect(response.parsed_body["message"]).to eq("Tutoría actualizada exitosamente")
    end

    it "devuelve error si los parámetros son inválidos" do
      put api_v1_tutoring_path(tutoring.id),
          params: { tutoring: { capacity: -1 } }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).not_to be_empty
    end
  end

  describe "DELETE #destroy" do
    it "elimina la tutoría correctamente" do
      tutoring # forzar creación
      expect {
        delete api_v1_tutoring_path(tutoring.id)
      }.to change { Tutoring.count }.by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end

  describe "GET #exists_user_tutoring" do
    it "devuelve true si el usuario ya está inscrito" do
      UserTutoring.create!(user: user, tutoring: tutoring)
      get exists_user_tutoring_api_v1_tutoring_path(tutoring.id)
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["exists"]).to be true
    end

    it "devuelve false si el usuario no está inscrito" do
      get exists_user_tutoring_api_v1_tutoring_path(tutoring.id)
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["exists"]).to be false
    end
  end

  describe "GET #upcoming" do
    it "devuelve solo las tutorías futuras en las que el usuario está inscripto" do
      alumno = User.create!(
        name: "Alumno",
        last_name: "Prueba",
        email: "alumno@mail.com",
        password: "password123",
        password_confirmation: "password123",
        faculty: faculty
      )

      course2 = Course.create!(name: "Matemática I", faculty: faculty)
      tutor2  = User.create!(
        name: "Tutor 2",
        last_name: "Test",
        email: "tutor2@mail.com",
        password: "password123",
        password_confirmation: "password123",
        faculty: faculty
      )

      tutoring_future = Tutoring.create!(
        course: course2,
        tutor: tutor2,
        capacity: 3,
        modality: "virtual",
        duration_mins: 60,
        scheduled_at: 1.day.from_now,
        state: "active"
      )

      # Crear tutoría como futura y luego cambiarle la fecha a pasada sin validación
      tutoring_past = Tutoring.create!(
        course: course2,
        tutor: tutor2,
        capacity: 3,
        modality: "virtual",
        duration_mins: 60,
        scheduled_at: 1.day.from_now,
        state: "active"
      )
      tutoring_past.update_column(:scheduled_at, 2.days.ago) # rubocop:disable Rails/SkipsModelValidations

      UserTutoring.create!(user: alumno, tutoring: tutoring_future)
      UserTutoring.create!(user: alumno, tutoring: tutoring_past)

      get upcoming_api_v1_tutorings_path, params: { user_id: alumno.id }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body

      expect(json.size).to eq(1)
      expect(json.first["id"]).to eq(tutoring_future.id)
      expect(json.first["subject"]).to eq(course2.name)
      expect(json.first["role"]).to eq("student")
    end
  end

  describe "DELETE #unsubscribe" do
    it "permite que un estudiante se desinscriba de una tutoría activa" do
      UserTutoring.create!(user: user, tutoring: tutoring)
      UserTutoring.create!(user: tutor, tutoring: tutoring)
      allow_any_instance_of(Api::V1::TutoringsController).to receive(:current_user).and_return(user)

      delete unsubscribe_api_v1_tutoring_path(tutoring.id)
      expect(response).to have_http_status(:no_content)
      expect(UserTutoring.where(user: user, tutoring: tutoring)).to be_empty
    end

    it "elimina la tutoría completa si se desinscribe el tutor" do
      allow_any_instance_of(Api::V1::TutoringsController).to receive(:current_user).and_return(tutor)
      UserTutoring.create!(user: tutor, tutoring: tutoring)

      expect {
        delete unsubscribe_api_v1_tutoring_path(tutoring.id)
      }.to change { Tutoring.count }.by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
