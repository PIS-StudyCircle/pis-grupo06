require 'rails_helper'

RSpec.describe "Courses API", type: :request do
  describe "GET /api/v1/courses" do
    before do
      facultad = Faculty.first
      # Creamos 25 cursos para probar paginación
      25.times do |i|
        Course.create!(name: "Curso #{i + 1}", code: "C#{i + 1}", institute: "Instituto #{i + 1}", faculty: facultad)
      end
    end

    it "devuelve la estructura completa de paginación" do
      get "/api/v1/courses" # por defecto page=1, items=20

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

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
  end
end
