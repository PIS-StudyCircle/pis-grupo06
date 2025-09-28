require 'rails_helper'

RSpec.describe "Api::V1::Users::UsersController", type: :request do
  let(:base_url) { "/api/v1/users" }

  let!(:university) { University.create!(name: "Universidad de la República") }
  let!(:faculty)    { Faculty.create!(name: "Facultad de Ingeniería", university: university) }

  let(:password) { "password123" }

  let(:user) {
    User.create!(
      name: "Admin",
      last_name: "Test",
      email: "admin@test.com",
      password: "password123",
      password_confirmation: "password123",
      faculty: faculty
    )
  }

  # Creamos usuarios para los tests
  let!(:juan) {
    User.create!(
      id: 1,
      name: "Juan",
      last_name: "Pérez",
      email: "juan.perez@example.com",
      password: password,
      password_confirmation: password,
      faculty: faculty
    )
  }
  let!(:maria) {
    User.create!(
      id: 2,
      name: "María",
      last_name: "Gómez",
      email: "maria.gomez@example.com",
      password: password,
      password_confirmation: password,
      faculty: faculty
    )
  }
  let!(:carlos) {
    User.create!(
      id: 3,
      name: "Carlos",
      last_name: "Fernández",
      email: "carlos.fernandez@example.com",
      password: password,
      password_confirmation: password,
      faculty: faculty
    )
  }

  before do
    # loguear usuario con Devise helper
    sign_in user
  end

  describe "GET #index" do
    it "devuelve todos los usuarios" do
      get "#{base_url}.json"
      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body["users"].length).to eq(4)
      expect(body["users"].pluck("name")).to include("Admin", "Juan", "María", "Carlos")
      expect(body["pagination"]["count"]).to eq(4)
    end

    it "filtra usuarios por búsqueda" do
      get "#{base_url}.json", params: { search: "María" }
      expect(response).to have_http_status(:ok)

      body = response.parsed_body
      expect(body["users"].length).to eq(1)
      expect(body["users"].first["name"]).to eq("María")
    end

    it "devuelve array vacío si no hay coincidencias" do
      get "#{base_url}.json", params: { search: "XYZ" }
      expect(response).to have_http_status(:ok)

      body = response.parsed_body
      expect(body["users"]).to be_empty
      expect(body["pagination"]["count"]).to eq(0)
    end
  end

  describe "GET #show" do
    it "devuelve un usuario existente" do
      get "#{base_url}/#{juan.id}.json"
      expect(response).to have_http_status(:ok)

      body = response.parsed_body
      expect(body["id"]).to eq(juan.id)
      expect(body["name"]).to eq("Juan")
    end

    it "devuelve 404 si el usuario no existe" do
      get "#{base_url}/999.json"
      expect(response).to have_http_status(:not_found)

      body = response.parsed_body
      expect(body["error"]).to eq("No se encontró el usuario solicitado")
    end
  end
end
