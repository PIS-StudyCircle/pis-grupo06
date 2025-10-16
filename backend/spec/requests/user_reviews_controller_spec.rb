require 'rails_helper'

RSpec.describe "Api::V1::Users::UserReviewsController", type: :request do
  let(:base_url) { "/api/v1/users/user_reviews" }

  let!(:university) { University.create!(name: "Universidad de la República") }
  let!(:faculty)    { Faculty.create!(name: "Facultad de Ingeniería", university: university) }

  let(:current_user) { User.create!(name: "Reviewer", last_name: "Test", email: "reviewer@example.com", password: "12345678", password_confirmation: "12345678", faculty: faculty) }
  let(:other_user) { User.create!(name: "Reviewed", last_name: "User", email: "reviewed@example.com", password: "12345678", password_confirmation: "12345678", faculty: faculty) }

  before do
    sign_in current_user
  end

  describe "GET #index" do
    it "devuelve las reseñas de un usuario" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)
      UserReview.create!(reviewer: current_user, reviewed_id: other_user.id, review: "Muy bueno!")

      get "#{base_url}.json", params: { reviewed_id: other_user.id }
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]["review"]).to eq("Muy bueno!")
      expect(json[0]["reviewer"]["id"]).to eq(current_user.id)
    end

    it "devuelve array vacío si no hay reseñas" do
      get "#{base_url}.json", params: { reviewed_id: other_user.id }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json).to eq([])
    end
  end

  describe "GET #can_review" do
    it "no permite reseñarse a sí mismo" do
      get "#{base_url}/can_review.json", params: { reviewed_id: current_user.id }
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json["can_review"]).to be false
    end

    it "permite reseñar si hay tutorías compartidas y no existe reseña previa" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)

      get "#{base_url}/can_review.json", params: { reviewed_id: other_user.id }
      json = JSON.parse(response.body)
      expect(json["can_review"]).to be true
    end

    it "no permite reseñar si ya existe reseña previa" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)
      UserReview.create!(reviewer: current_user, reviewed_id: other_user.id, review: "Ya reseñé")

      get "#{base_url}/can_review.json", params: { reviewed_id: other_user.id }
      json = JSON.parse(response.body)
      expect(json["can_review"]).to be false
    end

    it "no permite reseñar si no hay tutorías compartidas" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(false)

      get "#{base_url}/can_review.json", params: { reviewed_id: other_user.id }
      json = JSON.parse(response.body)
      expect(json["can_review"]).to be false
    end
  end

  describe "POST #create" do
    it "crea una reseña correctamente" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)

      post "#{base_url}.json", params: { reviewed_id: other_user.id, review: "Excelente!" }
      expect(response).to have_http_status(:created)

      json = JSON.parse(response.body)
      expect(json["review"]).to eq("Excelente!")
      expect(json["reviewer_id"]).to eq(current_user.id)
      expect(UserReview.count).to eq(1)
    end

    it "devuelve error si falta review" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)

      post "#{base_url}.json", params: { reviewed_id: other_user.id, review: "" }
      expect(response).to have_http_status(:unprocessable_content)

      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Review no puede estar en blanco")
    end
  end

  describe "PATCH #update" do
    it "actualiza la reseña correctamente" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)
      review = UserReview.create!(reviewer: current_user, reviewed_id: other_user.id, review: "Antigua")
      patch "#{base_url}/#{review.id}.json", params: { review: "Actualizada" }
      expect(response).to have_http_status(:ok)
      expect(review.reload.review).to eq("Actualizada")
    end
  end

  describe "DELETE #destroy" do
    it "elimina la reseña correctamente" do
      allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)
      review = UserReview.create!(reviewer: current_user, reviewed_id: other_user.id, review: "A eliminar")
      delete "#{base_url}/#{review.id}.json"
      expect(response).to have_http_status(:ok)
      expect(UserReview.exists?(review.id)).to be false
    end
  end
end
