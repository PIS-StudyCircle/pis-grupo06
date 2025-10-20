require 'rails_helper'

RSpec.describe "OmniauthCallbacks", type: :request do
  let!(:faculty) do
    Faculty.find_by(name: "Facultad de Ingeniería") ||
      Faculty.create!(name: "Facultad de Ingeniería",
                      university: University.first || University.create!(name: "Universidad de la República"))
  end

  let!(:user) do
    User.create!(
      email: "john.doe@example.com",
      password: "password123",
      password_confirmation: "password123",
      name: "John",
      last_name: "Doe",
      faculty: faculty
    )
  end

  let(:auth_hash) do
    OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "123456789",
      info: {
        email: user.email,
        first_name: user.name,
        last_name: user.last_name,
        name: "#{user.name} #{user.last_name}"
      },
      credentials: {
        token: "access_token_123",
        refresh_token: "refresh_token_456",
        expires_at: Time.zone.now.to_i + 3600
      }
    )
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = auth_hash
  end

  after do
    OmniAuth.config.mock_auth[:google_oauth2] = nil
    OmniAuth.config.test_mode = false
  end

  describe "GET /api/v1/users/auth/google_oauth2/callback" do
    context "when authentication succeeds" do
      it "logs in the user, sets cookies and redirects to frontend" do
        get "/api/v1/users/auth/google_oauth2/callback"

        # Verificamos usuario logueado
        logged_in_user = request.env['warden'].user
        expect(logged_in_user).to eq(user)

        # Redirección al frontend
        expect(response).to redirect_to(ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173'))
      end
    end

    context "when authentication fails" do
      it "redirects to failure URL" do
        # Simulamos error de OmniAuth
        OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials

        get "/api/v1/users/auth/google_oauth2/callback"

        expect(response).to redirect_to(
          "#{ENV.fetch('FRONTEND_FAILURE_URL', 'http://localhost:5173/iniciar_sesion')}?error=oauth_denied"
        )
      end
    end
  end
end
