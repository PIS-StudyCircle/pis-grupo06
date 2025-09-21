require 'rails_helper'

RSpec.describe "Api::V1::Users::Passwords", type: :request do
  let!(:universidad) { University.create!(name: "Universidad de Ejemplo") }
  let!(:facultad) { Faculty.create!(name: "Facultad de Ingeniería", university: universidad) }
  let!(:user) do
    User.create!(
      email: "test@example.com",
      password: "password123",
      password_confirmation: "password123",
      name: "Test",
      last_name: "User",
      faculty: facultad
    )
  end

  describe "POST /api/v1/users/password" do
    context "cuando el email es válido" do
      it "envía instrucciones de reseteo y retorna mensaje de éxito" do
        expect {
          post "/api/v1/users/password", params: { user: { email: user.email } }, as: :json
        }.to change { ActionMailer::Base.deliveries.count }.by(1)

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["message"]).to eq("Se envió un email con instrucciones para restablecer tu contraseña")
      end
    end

    # context "cuando el email no existe" do
    #   it "retorna errores" do
    #     post "/api/v1/users/password", params: { user: { email: "noexiste@example.com" } }, as: :json

    #     expect(response).to have_http_status(:unprocessable_entity)
    #     json = JSON.parse(response.body)
    #     expect(json["errors"]).to include("Email no encontrado")
    #   end
    # end
  end

  describe "PUT /api/v1/users/password" do
    it "resetea la contraseña correctamente" do
      token = user.send_reset_password_instructions

      put "/api/v1/users/password",
          params: {
            user: {
              reset_password_token: token,
              password: "newpassword123",
              password_confirmation: "newpassword123"
            }
          }, as: :json

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["message"]).to eq("Contraseña actualizada correctamente.")
      expect(user.reload.valid_password?("newpassword123")).to be true
    end

    it "retorna errores si el token es inválido" do
      put "/api/v1/users/password",
          params: {
            user: {
              reset_password_token: "token_invalido",
              password: "newpassword123",
              password_confirmation: "newpassword123"
            }
          }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = response.parsed_body
      expect(json["errors"]).to include(
        "El enlace de restablecimiento es inválido o ya ha sido utilizado. Por favor solicita uno nuevo."
      )
    end
  end
end
