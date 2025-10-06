require 'rails_helper'

RSpec.describe "Tutorings search", type: :request do
  let!(:university) { University.create!(name: "Universidad Test") }
  let!(:faculty)    { Faculty.create!(name: "Facultad Test", university: university) }
  let!(:user)       do
    User.create!(
      email: "test@test.com",
      password: "12345678",
      password_confirmation: "12345678",
      name: "Test",
      last_name: "User",
      faculty: faculty
    )
  end

  before { sign_in user }

  let!(:calculo)    { Course.create!(name: "Cálculo I", code: "CALC1", faculty: faculty) }
  let!(:fisica)     { Course.create!(name: "Física", code: "FIS1", faculty: faculty) }

  let!(:derivadas)  { Subject.create!(name: "Derivadas", course: calculo, creator: user) }
  let!(:integrales) { Subject.create!(name: "Integrales", course: calculo, creator: user) }
  let!(:vectores)   { Subject.create!(name: "Vectores", course: fisica, creator: user) }

  let!(:tutoring1) do
    Tutoring.create!(
      course: calculo,
      scheduled_at: 1.day.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      subjects: [derivadas, integrales]
    )
  end
  let!(:tutoring2) do
    Tutoring.create!(
      course: calculo,
      scheduled_at: 2.days.from_now,
      duration_mins: 60,
      modality: "presencial",
      capacity: 5,
      subjects: [derivadas]
    )
  end
  let!(:tutoring3) do
    Tutoring.create!(
      course: fisica,
      scheduled_at: 3.days.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5,
      subjects: [vectores]
    )
  end

  describe "GET /api/v1/tutorings?search=..." do
    it "filtra por materia (course) con coincidencia parcial y sin acentos" do
      get "/api/v1/tutorings", params: { search: "calculo", search_by: "course" }
      expect(response).to have_http_status(:ok)
      ids = response.parsed_body["tutorings"].pluck("id")
      expect(ids).to match_array([tutoring1.id, tutoring2.id])
    end

    it "filtra por tema (subject) con coincidencia parcial y sin acentos" do
      get "/api/v1/tutorings", params: { search: "deriv", search_by: "subject" }
      expect(response).to have_http_status(:ok)
      ids = response.parsed_body["tutorings"].pluck("id")
      expect(ids).to match_array([tutoring1.id, tutoring2.id])
    end

    it "devuelve vacío si no hay coincidencias por materias" do
      get "/api/v1/tutorings", params: { search: "derv", search_by: "course" }
      expect(response).to have_http_status(:ok)
      tutorings = response.parsed_body["tutorings"]
      expect(tutorings).to be_empty
    end

    it "devuelve vacío si no hay coincidencias por temas" do
      get "/api/v1/tutorings", params: { search: "calc", search_by: "subject" }
      expect(response).to have_http_status(:ok)
      tutorings = response.parsed_body["tutorings"]
      expect(tutorings).to be_empty
    end

    it "filtra correctamente cambiando de materia a tema y viceversa" do
      get "/api/v1/tutorings", params: { search: "física", search_by: "course" }
      expect(response.parsed_body["tutorings"].pluck("id")).to eq([tutoring3.id])

      get "/api/v1/tutorings", params: { search: "int", search_by: "subject" }
      expect(response.parsed_body["tutorings"].pluck("id")).to eq([tutoring1.id])

      get "/api/v1/tutorings", params: { search: "calc", search_by: "course" }
      expect(response.parsed_body["tutorings"].pluck("id")).to eq([tutoring1.id, tutoring2.id])
    end
  end
end
