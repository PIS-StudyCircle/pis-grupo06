require 'rails_helper'
require 'devise/jwt/test_helpers'
include ActiveSupport::Testing::TimeHelpers

RSpec.describe "Api::V1::Users", type: :request do
  let!(:university) { University.create!(name: "Universidad de la República") }
  let!(:faculty)    { Faculty.create!(name: "Facultad de Ingeniería", university: university) }

  let(:password) { "password123" }
  let!(:user) do
    User.create!(
      email: "john.doe@example.com",
      password: password,
      password_confirmation: password,
      name: "John",
      last_name: "Doe",
      description: "Test user",
      faculty: faculty
    )
  end

  let(:base_headers) do
    { "ACCEPT" => "application/json", "CONTENT_TYPE" => "application/json" }
  end

  def extract_user(json)
    json.dig("data", "user") || json["data"] || json["user"] || json
  end

  describe "GET /api/v1/users/me" do
    context "when authenticated" do
      it "returns current user data" do
        headers = Devise::JWT::TestHelpers.auth_headers(base_headers, user)

        get "/api/v1/users/me", headers: headers

        expect(response).to have_http_status(:ok)
        json    = response.parsed_body
        payload = extract_user(json)

        expect(payload).to be_present
        expect(payload["email"]).to eq(user.email)
        expect(payload["name"]).to eq(user.name)
        expect(payload["last_name"]).to eq(user.last_name)
        expect(payload["description"]).to eq(user.description)

        if payload.key?("faculty_id")
          expect(payload["faculty_id"]).to eq(faculty.id)
        elsif payload.key?("faculty")
          expect(payload.dig("faculty", "id")).to eq(faculty.id)
        end
      end
    end

    context "when missing token" do
      it "returns unauthorized" do
        get "/api/v1/users/me", headers: base_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when token is invalid" do
      it "returns unauthorized" do
        headers = base_headers.merge("Authorization" => "Bearer invalid.token.here")
        get "/api/v1/users/me", headers: headers
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "response shape / serializer" do
      it "devuelve user con los atributos del serializer y sin campos sensibles" do
        headers = Devise::JWT::TestHelpers.auth_headers(base_headers, user)

        get "/api/v1/users/me", headers: headers

        expect(response).to have_http_status(:ok)

        json  = response.parsed_body
        attrs = json.fetch("user")

        expected_attrs =
          UserSerializer.new(user, params: { current_user: user }).serializable_hash[:data][:attributes].as_json

        expect(attrs).to include(expected_attrs)

        expect(json.dig("user", "counts")).to eq(
          "tutorias_dadas" => 0,
          "tutorias_recibidas" => 0,
          "resenas_dadas" => 0,
          "feedback_dado" => 0
        )

        expect(attrs).not_to include(
          "encrypted_password",
          "reset_password_token",
          "reset_password_sent_at",
          "remember_created_at",
          "jti",
          "provider",
          "uid"
        )
      end
    end
  end

  describe ".from_omniauth" do
    let(:auth) do
      OpenStruct.new(
        provider: "google_oauth2",
        uid: "123456789",
        info: OpenStruct.new(
          email: "new_user@example.com", # distinto del existente
          first_name: "Alice",
          last_name: "Smith",
          name: "Alice Smith"
        ),
        credentials: OpenStruct.new(
          token: "access_token_123",
          refresh_token: "refresh_token_456",
          expires_at: Time.zone.now.to_i + 3600
        )
      )
    end

    context "when user does not exist" do
      it "creates a new user with data from auth" do
        expect { User.from_omniauth(auth) }.to change(User, :count).by(1)

        user = User.last
        expect(user.email).to eq("new_user@example.com")
        expect(user.provider).to eq("google_oauth2")
        expect(user.uid).to eq("123456789")
        expect(user.name).to eq("Alice")
        expect(user.last_name).to eq("Smith")
        expect(user.faculty.name).to eq("Facultad de Ingeniería")
      end
    end

    context "when user exists by email but not provider/uid" do
      let!(:user) do
        User.create!(
          email: "john.doe@example.com",
          password: password,
          password_confirmation: password,
          name: "John",
          last_name: "Doe",
          faculty: faculty
        )
      end

      let(:auth) do
        OpenStruct.new(
          provider: "google_oauth2",
          uid: "123456789",
          info: OpenStruct.new(
            email: "john.doe@example.com", # igual al existente
            first_name: "John",
            last_name: "Doe",
            name: "John Doe"
          ),
          credentials: OpenStruct.new(
            token: "access_token_123",
            refresh_token: "refresh_token_456",
            expires_at: Time.zone.now.to_i + 3600
          )
        )
      end

      it "updates provider and uid and keeps existing email" do
        expect(User.count).to eq(1) # aseguramos que no haya duplicados

        result = User.from_omniauth(auth)
        user.reload

        expect(result.id).to eq(user.id)
        expect(user.provider).to eq("google_oauth2")
        expect(user.uid).to eq("123456789")
        expect(user.email).to eq("john.doe@example.com")
      end
    end

    context "when user exists by provider and uid" do
      before do
        user.update!(provider: "google_oauth2", uid: "123456789")
      end

      it "updates access tokens and name info" do
        old_refresh_token = "old_refresh_token"
        user.update!(google_refresh_token: old_refresh_token)

        result = User.from_omniauth(auth)
        user.reload

        expect(result.id).to eq(user.id)
        expect(user.google_access_token).to eq("access_token_123")
        expect(user.google_refresh_token).to eq("refresh_token_456")
        expect(user.google_expires_at).to be_within(5.seconds).of(Time.zone.at(auth.credentials.expires_at))
        expect(user.name).to eq("John")
        expect(user.last_name).to eq("Doe")
      end

      it "keeps old refresh token if new one is nil" do
        auth.credentials.refresh_token = nil

        user.update!(google_refresh_token: "keep_me")

        User.from_omniauth(auth)
        user.reload

        expect(user.google_refresh_token).to eq("keep_me")
      end
    end

    context 'cuando el usuario tiene actividad registrada' do
      it 'devuelve los counts correctos según sus asociaciones' do
        otro_usuario = User.create!(
          email: "jane.doe@example.com",
          password: password,
          password_confirmation: password,
          name: "Jane",
          last_name: "Doe",
          faculty: faculty
        )

        course = Course.create!(name: "Matemática I")

        # Helper para crear tutorías activas con usuarios
        def create_tutoring(tutor:, alumno:, course:)
          tutoring = Tutoring.create!(
            tutor: tutor,
            creator: tutor,
            course: course,
            modality: "virtual",
            duration_mins: 60,
            capacity: 5,
            scheduled_at: 1.minute.from_now,
            state: :active
          )
          UserTutoring.create!(user: alumno, tutoring: tutoring)
          tutoring
        end

        # Crear 2 tutorías donde el usuario es tutor
        create_tutoring(tutor: user, alumno: otro_usuario, course: course)
        create_tutoring(tutor: user, alumno: otro_usuario, course: course)

        # Crear 2 tutorías donde el usuario es alumno
        tutoring3 = create_tutoring(tutor: otro_usuario, alumno: user, course: course)
        create_tutoring(tutor: otro_usuario, alumno: user, course: course)

        # Avanzar el tiempo y marcar tutorías como finalizadas
        travel_to 2.hours.from_now do
          Tutorings::MarkFinishedTutoringsJob.perform_now
        end

        headers = Devise::JWT::TestHelpers.auth_headers(base_headers, user)

        # Crear reseña mediante controller (params anidados según strong params)
        post "/api/v1/users/user_reviews",
             params: { reviewed_id: otro_usuario.id, review: "Excelente tutor" },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:created)

        # Crear feedback mediante controller
        post "/api/v1/users/user_feedbacks",
             params: { tutoring_id: tutoring3.id, rating: 5.0 },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:created)

        # Recargar usuario para obtener los contadores actualizados
        user.reload

        # Hacer GET /me autenticado con JWT
        get "/api/v1/users/me", headers: headers
        expect(response).to have_http_status(:ok)
        json  = response.parsed_body
        attrs = json.fetch("user")

        expected_attrs =
          UserSerializer.new(user, params: { current_user: user }).serializable_hash[:data][:attributes].as_json
        expected_attrs.except!("created_at", "updated_at")
        attrs_to_compare = attrs.except("created_at", "updated_at")

        expect(attrs_to_compare).to include(expected_attrs)

        expect(json.dig("user", "counts")).to eq(
          "tutorias_dadas" => 2,
          "tutorias_recibidas" => 2,
          "resenas_dadas" => 1,
          "feedback_dado" => 1
        )
      end
    end
  end
end
