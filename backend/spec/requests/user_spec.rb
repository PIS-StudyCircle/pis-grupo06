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
          UserSerializer.new(user).serializable_hash[:data][:attributes].as_json

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
end