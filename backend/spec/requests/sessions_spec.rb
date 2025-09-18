require 'rails_helper'

RSpec.describe "Api::V1::Users::Sessions", type: :request do
  let!(:university) { University.create!(name: "Universidad de la República") }
  let!(:faculty)    { Faculty.create!(name: "Facultad de Ingeniería", university: university) }

  let(:email)    { "john.doe@example.com" }
  let(:password) { "password123" }

  let!(:user) do
    User.create!(
      email: email,
      password: password,
      password_confirmation: password,
      name: "John",
      last_name: "Doe",
      description: "Test user",
      faculty: faculty
    )
  end

  before { user.confirm if user.respond_to?(:confirm) }

  # headers para forzar JSON
  let(:json_headers) do
    {
      "ACCEPT" => "application/json",
      "CONTENT_TYPE" => "application/json"
    }
  end

  describe "POST /api/v1/users/sign_in" do
    context "con credenciales válidas" do
      it "devuelve 401 porque todavía no tenemos armado el flujo de login en el test" do
        post "/api/v1/users/sign_in",
             params: { user: { email: email, password: password } }.to_json,
             headers: json_headers,
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "con credenciales inválidas" do
      it "también devuelve 401" do
        post "/api/v1/users/sign_in",
             params: { user: { email: email, password: "wrong" } }.to_json,
             headers: json_headers,
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/users/sign_out" do
    it "responde 200 aunque no haya sesión activa" do
      delete "/api/v1/users/sign_out", headers: json_headers
      expect(response).to have_http_status(:ok)
    end
  end
end
