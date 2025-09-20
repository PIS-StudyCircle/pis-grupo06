require "rails_helper"

RSpec.describe UserMailer, type: :mailer do
  describe "#reset_password_instructions" do
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
    let(:token) { "token123" }
    let(:mail) { UserMailer.reset_password_instructions(user, token) }

    it "genera un correo con el asunto correcto" do
      expect(mail.subject).to eq("StudyCircle - Restablecer tu contraseña")
    end

    it "envía el correo al email correcto" do
      expect(mail.to).to eq([user.email])
    end

    it "usa la dirección de origen configurada" do
      expect(mail.from).to eq(["studycircle.project@gmail.com"])
    end

    it "incluye el token de reset en el cuerpo HTML" do
      expect(mail.body.encoded).to include(token)
    end

    it "incluye el link al frontend en el cuerpo del correo (HTML)" do
      expect(mail.html_part.body.decoded).to include("http://localhost:5173/reset_password?reset_password_token=#{token}")
    end

    it "incluye el link al frontend en el cuerpo del correo (texto)" do
      expect(mail.text_part.body.decoded).to include("http://localhost:5173/reset_password?reset_password_token=#{token}")
    end
  end
end
