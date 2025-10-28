require "rails_helper"

RSpec.describe "Api::V1::Users::UserFeedbacks", type: :request do
  include Devise::Test::IntegrationHelpers

  def json
    response.parsed_body
  end

  let!(:university) { University.create!(name: "Universidad Demo") }
  let!(:faculty)    { Faculty.create!(name: "Facultad Demo", university: university) }

  let!(:tutor) do
    User.create!(
      email: "tutor@example.com",
      password: "12345678",
      password_confirmation: "12345678",
      name: "Tutor",
      last_name: "Demo",
      faculty: faculty
    )
  end

  let!(:student) do
    User.create!(
      email: "student@example.com",
      password: "12345678",
      password_confirmation: "12345678",
      name: "Alumno",
      last_name: "Prueba",
      faculty: faculty
    )
  end

  let!(:course) { Course.create!(name: "Curso Demo") }

  def build_tutoring_for(tutor_user)
    Tutoring.create!(
      scheduled_at: 1.day.from_now,
      duration_mins: 60,
      modality: "presencial",
      capacity: 2,
      enrolled: 0,
      course: course,
      created_by_id: tutor_user.id,
      tutor_id: tutor_user.id
    )
  end

  describe "POST /api/v1/users/user_feedbacks (puntuar tutor)" do
    context "cuando el usuario está autenticado" do
      before { sign_in(student) }

      it "crea el feedback y devuelve 201 con promedio actualizado" do
        t1 = build_tutoring_for(tutor)
        t2 = build_tutoring_for(tutor)

        s1 = User.create!(email: "s1@ex.com", password: "12345678", password_confirmation: "12345678",
                          faculty: faculty, name: "S1", last_name: "Demo")
        s2 = User.create!(email: "s2@ex.com", password: "12345678", password_confirmation: "12345678",
                          faculty: faculty, name: "S2", last_name: "Demo")
        Feedback.create!(tutor_id: tutor.id, student_id: s1.id, tutoring_id: t1.id, rating: 4.0)
        Feedback.create!(tutor_id: tutor.id, student_id: s2.id, tutoring_id: t2.id, rating: 5.0)

        tutoring = build_tutoring_for(tutor)

        post "/api/v1/users/user_feedbacks",
             params: { tutoring_id: tutoring.id, rating: 3.5 }

        expect(response).to have_http_status(:created)
        expect(json["ok"]).to eq(true)
        expect(json["average_rating"]).to eq(4.17)

        fb = json["feedback"]
        expect(fb["rating"].to_f).to eq(3.5)
        expect(fb.dig("student", "email")).to eq("student@example.com")
        expect(fb.dig("tutor", "email")).to eq("tutor@example.com")

        created = Feedback.last
        expect(created.student_id).to eq(student.id)
        expect(created.tutor_id).to eq(tutor.id)
        expect(created.tutoring_id).to eq(tutoring.id)
        expect(created.rating).to eq(3.5)
      end

      it "rechaza si el usuario intenta calificarse a sí mismo (403)" do
        sign_out(student)
        sign_in(tutor)

        tutoring = build_tutoring_for(tutor)
        post "/api/v1/users/user_feedbacks", params: { tutoring_id: tutoring.id, rating: 4.0 }

        expect(response).to have_http_status(:forbidden)
        expect(json["error"]).to match(/No puedes calificarte a ti mismo/i)
      end

      it "rechaza duplicado para la misma tutoría con 409" do
        tutoring = build_tutoring_for(tutor)
        Feedback.create!(tutor_id: tutor.id, student_id: student.id, tutoring_id: tutoring.id, rating: 4.0)

        post "/api/v1/users/user_feedbacks", params: { tutoring_id: tutoring.id, rating: 5.0 }

        expect(response).to have_http_status(:conflict)
        expect(json["error"]).to match(/Ya dejaste calificación/i)
      end

      it "valida paso de 0.5 y devuelve 422 si no cumple" do
        tutoring = build_tutoring_for(tutor)
        post "/api/v1/users/user_feedbacks", params: { tutoring_id: tutoring.id, rating: 3.7 }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json["errors"].join(" ")).to match(/pasos de 0\.5/i)
      end

      it "valida rango [0.5, 5.0] con 422 si está fuera" do
        tutoring = build_tutoring_for(tutor)
        post "/api/v1/users/user_feedbacks", params: { tutoring_id: tutoring.id, rating: 5.5 }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json["errors"].join(" ").downcase).to match(/less|greater|menor|mayor/)
      end

      it "devuelve 422 si falta tutoring_id o rating" do
        post "/api/v1/users/user_feedbacks", params: { rating: 4.0 }
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json["error"]).to match(/Falta tutoring_id o rating/i)

        tutoring = build_tutoring_for(tutor)
        post "/api/v1/users/user_feedbacks", params: { tutoring_id: tutoring.id }
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json["error"]).to match(/Falta tutoring_id o rating/i)
      end
    end

    context "cuando NO está autenticado" do
      it "devuelve 302" do
        tutoring = build_tutoring_for(tutor)
        post "/api/v1/users/user_feedbacks", params: { tutoring_id: tutoring.id, rating: 4.0 }
        expect([302]).to include(response.status)
      end
    end
  end

  describe "GET /api/v1/users/user_feedbacks/check" do
    before { sign_in(student) }

    it "retorna has_feedback: true " do
      tutoring = build_tutoring_for(tutor)
      Feedback.create!(tutor_id: tutor.id, student_id: student.id, tutoring_id: tutoring.id, rating: 4.5)
      get "/api/v1/users/user_feedbacks/check",
          params: { user_id: student.id, tutoring_id: tutoring.id }

      expect(response).to have_http_status(:ok)
      expect(json["has_feedback"]).to eq(true)
      expect(json["rating"]).to eq(4.5)
    end

    it "retorna has_feedback: false si no existe feedback" do
      tutoring = build_tutoring_for(tutor)

      get "/api/v1/users/user_feedbacks/check",
          params: { user_id: student.id, tutoring_id: tutoring.id }

      expect(response).to have_http_status(:ok)
      expect(json["has_feedback"]).to eq(false)
    end

    it "422 si faltan parámetros" do
      get "/api/v1/users/user_feedbacks/check", params: { user_id: student.id }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["error"]).to match(/Falta tutoring_id o user_id/i)
    end

    it "404 si la tutoría no existe" do
      get "/api/v1/users/user_feedbacks/check",
          params: { user_id: student.id, tutoring_id: 999_999 }
      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to match(/Tutoría no encontrada/i)
    end
  end

  describe "GET /api/v1/users/user_feedbacks (index)" do
    before { sign_in(student) }

    it "devuelve promedio y total del tutor pasado por parámetro" do
      t1 = build_tutoring_for(tutor)
      t2 = build_tutoring_for(tutor)
      t3 = build_tutoring_for(tutor)

      s1 = User.create!(email: "s1@ex.com", password: "12345678", password_confirmation: "12345678", faculty: faculty,
                        name: "S1", last_name: "Demo")
      s2 = User.create!(email: "s2@ex.com", password: "12345678", password_confirmation: "12345678", faculty: faculty,
                        name: "S2", last_name: "Demo")
      s3 = User.create!(email: "s3@ex.com", password: "12345678", password_confirmation: "12345678", faculty: faculty,
                        name: "S3", last_name: "Demo")

      Feedback.create!(tutor_id: tutor.id, student_id: s1.id, tutoring_id: t1.id, rating: 4.0)
      Feedback.create!(tutor_id: tutor.id, student_id: s2.id, tutoring_id: t2.id, rating: 5.0)
      Feedback.create!(tutor_id: tutor.id, student_id: s3.id, tutoring_id: t3.id, rating: 3.5)

      get "/api/v1/users/user_feedbacks", params: { tutor_id: tutor.id }

      expect(response).to have_http_status(:ok)
      expect(json["average_rating"]).to eq(4.17)
      expect(json["total_feedbacks"]).to eq(3)
      expect(json["feedbacks"]).to be_an(Array)
      expect(json["feedbacks"].first).to include("id", "rating", "created_at")
    end

    it "404 si el tutor no existe" do
      get "/api/v1/users/user_feedbacks", params: { tutor_id: 999_999 }
      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to match(/Tutor no encontrado/i)
    end

    it "cuando no se pasa tutor_id usa current_user" do
      get "/api/v1/users/user_feedbacks"
      expect(response).to have_http_status(:ok)
      expect(json["average_rating"]).to eq(0.0)
      expect(json["total_feedbacks"]).to eq(0)
    end
  end
end
