require 'rails_helper'

RSpec.describe "OAuth", type: :request do
  let!(:universidad) { University.first || University.create!(name: "Universidad de Prueba") }
  let!(:facultad) { Faculty.first || Faculty.create!(name: "Facultad de Ingeniería", university: universidad) }

  before(:each) do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new(
      provider: 'google_oauth2',
      uid: '123456',
      info: {
        email: 'pepe@gmail.com',
        name: 'Pepe',
        last_name: 'Pepe',
        faculty_id: facultad.id
      }
    )
  end

  after do
    OmniAuth.config.test_mode = false
  end

  # 1. Usuario cancela el flujo (no hay callback)
  it "no crea usuario ni inicia sesión si el flujo de Google no se completa" do
    expect {
      get "/api/v1/users/auth/google_oauth2"
      expect(response).to have_http_status(:found)
      # No llamamos al callback
    }.not_to change(User, :count)

    user_id_in_session = session["warden.user.user.key"]&.dig(0, 0)
    expect(user_id_in_session).to eq(nil)
  end

  # 2. Usuario nuevo: se registra y autentica
  it "registra y autentica un usuario nuevo con Google" do
    user = User.find_by(email: "pepe@gmail.com")
    expect(user).to eq(nil)

    expect {
      get "/api/v1/users/auth/google_oauth2/callback"
      expect(response).to have_http_status(:found)
    }.to change(User, :count).by(1)

    user = User.find_by(email: "pepe@gmail.com")
    jwt_cookie = response.cookies["jwt"]
    expect(jwt_cookie).to be_present
    expect(user.provider).to eq("google_oauth2")
    expect(user.uid).to eq("123456")

    payload = jwt_cookie.split('.')[1]
    padded = payload.ljust((payload.length + 3) & ~3, '=') # padding seguro
    json = JSON.parse(Base64.urlsafe_decode64(padded))
    expect(Integer(json["sub"])).to eq(user.id)
  end

  # 3. Usuario ya existe pero no está vinculado: lo vincula y autentica
  it "vincula Google a un usuario existente no vinculado y lo autentica" do
    user = User.create!(
      email: "pepe@gmail.com",
      password: "pepe1234",
      password_confirmation: "pepe1234",
      name: "Pepe",
      last_name: "Pepe",
      faculty_id: facultad.id
      # Sin provider ni uid
    )

    expect {
      get "/api/v1/users/auth/google_oauth2/callback"
      expect(response).to have_http_status(:found)
      user.reload
    }.not_to change(User, :count)

    jwt_cookie = response.cookies["jwt"]
    expect(jwt_cookie).to be_present
    expect(user.provider).to eq("google_oauth2")
    expect(user.uid).to eq("123456")

    payload = jwt_cookie.split('.')[1]
    padded = payload.ljust((payload.length + 3) & ~3, '=')
    json = JSON.parse(Base64.urlsafe_decode64(padded))
    expect(Integer(json["sub"])).to eq(user.id)
  end

  # 4. Usuario ya existe y está vinculado: solo autentica
  it "inicia sesión si el usuario ya está vinculado con Google" do
    user = User.create!(
      email: "pepe@gmail.com",
      password: "pepe1234",
      password_confirmation: "pepe1234",
      name: "Pepe",
      last_name: "Pepe",
      faculty_id: facultad.id,
      provider: "google_oauth2",
      uid: "123456"
    )

    expect {
      get "/api/v1/users/auth/google_oauth2/callback"
      expect(response).to have_http_status(:found)
      user.reload
    }.not_to change(User, :count)

    jwt_cookie = response.cookies["jwt"]
    expect(jwt_cookie).to be_present
    expect(user.provider).to eq("google_oauth2")
    expect(user.uid).to eq("123456")

    payload = jwt_cookie.split('.')[1]
    padded = payload.ljust((payload.length + 3) & ~3, '=')
    json = JSON.parse(Base64.urlsafe_decode64(padded))
    expect(Integer(json["sub"])).to eq(user.id)
  end
end