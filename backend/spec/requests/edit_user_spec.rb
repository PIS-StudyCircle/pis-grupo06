# spec/requests/edit_user_spec.rb
require "rails_helper"

RSpec.describe "Api::V1::Users::UsersController#update", type: :request do
  include Devise::Test::IntegrationHelpers

  before(:all) do
    Rails.application.routes.default_url_options[:host] = "http://test.host"
    ActiveStorage::Current.url_options = { host: "http://test.host" } if defined?(ActiveStorage::Current)
  end
  let!(:university) { defined?(University) ? (University.first || University.create!(name: "Universidad Seed")) : nil }
  let!(:faculty)    do
    if defined?(Faculty)
      Faculty.first || Faculty.create!(name: "Facultad Seed", university: (university if defined?(University)))
    end
  end
  let!(:role)       { defined?(Role) ? (Role.first || Role.create!(name: "student")) : nil }

  let!(:user) do
    attrs = {
      name: "Nombre",
      last_name: "Viejo",
      description: "Desc vieja",
      email: "test_update@example.com",
      password: "password123",
      password_confirmation: "password123"
    }
    attrs[:faculty] = faculty if defined?(Faculty)
    attrs[:role]    = role    if defined?(Role)

    u = User.create!(**attrs)
    u.confirm if u.respond_to?(:confirm)
    u
  end

  def json
    JSON.parse(response.body)
  end

  describe "PATCH /api/v1/users/:id" do
    context "cuando el usuario está autenticado" do
      before { sign_in user }

      it "actualiza name, last_name y description y devuelve mensaje de éxito" do
        patch "/api/v1/users/#{user.id}", params: {
          user: { name: "Ana", last_name: "Pérez", description: "Nueva descripción" }
        }

        expect(response).to have_http_status(:ok)
        expect(json["message"]).to eq("Perfil actualizado exitosamente")
        expect(json.dig("data", "user")).to include(
          "name" => "Ana",
          "last_name" => "Pérez",
          "description" => "Nueva descripción"
        )

        user.reload
        expect(user.name).to eq("Ana")
        expect(user.last_name).to eq("Pérez")
        expect(user.description).to eq("Nueva descripción")
      end

      it "adjunta una profile_photo si se envía y responde OK" do
        tmp = Tempfile.new(["avatar", ".png"])
        tmp.binmode
        tmp.write("\x89PNG\r\n\x1A\n") 
        tmp.rewind
        upload = Rack::Test::UploadedFile.new(tmp.path, "image/png")

        patch "/api/v1/users/#{user.id}",
              params: { user: { name: "Ana", last_name: "Pérez", description: "Con foto", profile_photo: upload } }

        expect(response).to have_http_status(:ok)
        expect(json["message"]).to eq("Perfil actualizado exitosamente")

        user.reload
        expect(user.profile_photo).to be_attached
      ensure
        tmp.close
        tmp.unlink
      end

      it "devuelve 422 si la validación falla" do
        patch "/api/v1/users/#{user.id}", params: { user: { name: "" } }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json["message"]).to eq("No se pudo actualizar el perfil")
        expect(json["errors"]).to be_present
      end
    end

    context "cuando NO está autenticado" do
      it "responde 401 (unauthorized)" do
        patch "/api/v1/users/#{user.id}",
              params: { user: { name: "Ana" } },
              as: :json 
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
