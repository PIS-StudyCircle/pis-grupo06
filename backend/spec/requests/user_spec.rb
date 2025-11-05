require 'rails_helper'
require 'devise/jwt/test_helpers'

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

        expect(attrs).to eq(expected_attrs)

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
  end
end
