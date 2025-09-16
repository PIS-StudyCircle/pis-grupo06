require 'rails_helper'

RSpec.describe "Courses API", type: :request do

  let!(:universidad) { University.create!(name: "Universidad de Ejemplo") }
  let!(:facultad) { Faculty.create!(name: "Facultad de Ingeniería", university: universidad) }

  let!(:user) do
    User.create!(
      email: "test@example.com",
      password: "password",
      password_confirmation: "password",
      name: "Test",
      last_name: "User",
      faculty: facultad
    )
  end

  describe "GET /api/v1/courses" do
    before do
      25.times do |i|
        Course.create!(name: "Curso #{i + 1}", code: "C#{i + 1}", institute: "Instituto #{i + 1}", faculty: facultad)
      end
    end

    it "devuelve la estructura completa de paginación" do
      get "/api/v1/courses" # por defecto page=1, items=20

      expect(response).to have_http_status(:ok)

      json = response.parsed_body

      expect(json).to have_key("courses")
      expect(json["courses"].size).to eq(20) # porque pagy items=20

      expect(json).to have_key("pagination")

      # Chequeamos campos típicos que genera Pagy
      pagination = json["pagination"]
      expect(pagination).to include(
        "prev",
        "next",
        "page",
        "last",
        "count"
      )

      # Verificamos valores específicos
      expect(pagination["prev"]).to eq(nil)
      expect(pagination["next"]).to eq(2)
      expect(pagination["page"]).to eq(1)
      expect(pagination["last"]).to eq(2)
      expect(pagination["count"]).to eq(25)
    end

    it "filtra los cursos por nombre" do
      get "/api/v1/courses", params: { search: "Curso 1" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body

      expect(json["courses"].all? { |c| c["name"].include?("Curso 1") }).to be true
    end
  end

  describe "GET /api/v1/courses/:id" do

    let!(:course_with_subjects) do
      course = Course.create!(name: "Curso Especial", code: "CE1", institute: "Instituto Especial", faculty: facultad)
      3.times do |i|
        course.subjects.create!(name: "Tema #{i + 1}", creator: user)
      end
      course
    end

    it "devuelve un curso con sus subjects" do
      get "/api/v1/courses/#{course_with_subjects.id}"

      expect(response).to have_http_status(:ok)
      json = response.parsed_body

      expect(json["name"]).to eq("Curso Especial")
      expect(json["subjects"].size).to eq(3)
      expect(json["subjects"].map { |s| s["name"] }).to contain_exactly("Tema 1", "Tema 2", "Tema 3")
    end

    it "devuelve 404 si el curso no existe" do
      get "/api/v1/courses/999999"

      expect(response).to have_http_status(:not_found)
      json = response.parsed_body
      expect(json["error"]).to eq("Course not found")
    end
  end
end
