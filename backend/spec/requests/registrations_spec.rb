require 'rails_helper'

RSpec.describe "Api::V1::Users::Registrations", type: :request do
  let!(:university) { University.create!(name: "Universidad de la República") }

  let!(:faculty) { Faculty.create!(name: "Facultad de Ingeniería", university: university) }

  let(:valid_params) do
    {
      user: {
        email: "john.doe@example.com",
        password: "password123",
        password_confirmation: "password123",
        name: "John",
        last_name: "Doe",
        description: "Test user"
      }
    }
  end

  let(:invalid_params) do
    {
      user: {
        email: "john.doe@example.com",
        password: "password123",
        password_confirmation: "wrong",
        name: "John",
        last_name: "Doe",
        description: "Test user"
      }
    }
  end

  describe "POST /api/v1/users (sign up)" do
    context "with valid params" do
      it "creates a new user and returns success response" do
        expect {
          post "/api/v1/users", params: valid_params
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["message"]).to eq("Signed up successfully.")
        expect(json["data"]["user"]["email"]).to eq("john.doe@example.com")
        created_user = User.find_by(email: "john.doe@example.com")
        expect(created_user).to be_present
        expect(created_user.faculty_id).to eq(faculty.id)
      end
    end

    context "with invalid params" do
      it "does not create a user and returns error response" do
        expect {
          post "/api/v1/users", params: invalid_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["message"]).to eq("User couldn't be created successfully.")
        expect(json["errors"]).not_to be_empty
      end
    end

    context "with missing params" do
      it "returns bad_request" do
        post "/api/v1/users", params: {}
        expect(response).to have_http_status(:bad_request)
        json = JSON.parse(response.body)
        expect(json["message"]).to match(/param is missing or the value is empty/i)
      end
    end
  end
end
