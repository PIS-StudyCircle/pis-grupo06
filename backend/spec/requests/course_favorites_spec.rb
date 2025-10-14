require "rails_helper"

RSpec.describe "CourseFavorites API", type: :request do
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

  let!(:course1) { Course.create!(name: "Curso 1", code: "C1", institute: "Instituto #1", faculty: facultad) }
  let!(:course2) { Course.create!(name: "Curso 2", code: "C2", institute: "Instituto #2", faculty: facultad) }

  context "sin autenticar" do
    it "no permite favoritear" do
      post "/api/v1/courses/#{course1.id}/favorite", as: :json
      expect(response).to have_http_status(:unauthorized).or have_http_status(:forbidden)
    end

    it "no permite quitar favorito" do
      delete "/api/v1/courses/#{course1.id}/favorite", as: :json
      expect(response).to have_http_status(:unauthorized).or have_http_status(:forbidden)
    end
  end

  context "autenticado" do
    before { sign_in user }

    it "crea favorito al hacer POST" do
      expect {
        post "/api/v1/courses/#{course1.id}/favorite", as: :json
      }.to change(user.favorite_courses, :count).by(1)
      expect(user.favorite_courses.pluck(:course_id)).to include(course1.id)
      expect(response).to have_http_status(:created)
      body = response.parsed_body
      expect(body["favorite"]).to be true
    end

    it "quita favorito al hacer DELETE" do
      user.favorite_courses.create!(course: course1)
      user.favorite_courses.create!(course: course2)
      expect {
        delete "/api/v1/courses/#{course1.id}/favorite", as: :json
      }.to change(user.favorite_courses, :count).by(-1)
      expect(user.favorite_courses.pluck(:course_id)).not_to include(course1.id)
      expect(response).to have_http_status(:no_content).or have_http_status(:ok)
    end

    it "no duplica al crear" do
      post "/api/v1/courses/#{course1.id}/favorite", as: :json
      expect(response).to have_http_status(:created)

      expect {
        post "/api/v1/courses/#{course1.id}/favorite", as: :json
      }.not_to change(user.favorite_courses, :count)

      expect(response).to have_http_status(:created).or have_http_status(:ok)
    end

    it "no permite a un usuario borrar el favorito de otro" do
      user2 = User.create!(
        email: "other@example.com",
        password: "password",
        password_confirmation: "password",
        name: "Other",
        last_name: "User",
        faculty: facultad
      )

      user2.favorite_courses.create!(course: course1)
      expect(user2.favorite_courses.pluck(:course_id)).to include(course1.id)

      delete "/api/v1/courses/#{course1.id}/favorite", as: :json

      expect(response).to have_http_status(:no_content).or have_http_status(:ok)

      user2.reload
      expect(user2.favorite_courses.pluck(:course_id)).to include(course1.id)
    end

    it "elimina sin error si no existe favorito (idempotente)" do
      expect {
        delete "/api/v1/courses/#{course2.id}/favorite", as: :json
      }.not_to change(user.favorite_courses, :count)
      expect(response).to have_http_status(:no_content).or have_http_status(:ok)
    end

    it "devuelve 404 al intentar favoritear un curso inexistente" do
      post "/api/v1/courses/1/favorite", as: :json
      expect(response).to have_http_status(:not_found)
    end

    it "devuelve 404 al intentar eliminar favorito de un curso inexistente" do
      delete "/api/v1/courses/1/favorite", as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
