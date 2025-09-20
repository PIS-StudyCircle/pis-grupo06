require 'rails_helper'
require 'devise/jwt/test_helpers'

RSpec.describe "Eliminar cuenta", type: :request do
  let!(:universidad) { University.first || University.create!(name: "Universidad de Prueba") }
  let!(:facultad) { Faculty.first || Faculty.create!(name: "Facultad de Ingeniería", university: universidad) }

  let(:user) {
    User.create!(
      email: "pepe@gmail.com",
      password: "pepe1234",
      password_confirmation: "pepe1234",
      name: "Pepe",
      last_name: "Pepe",
      faculty: Faculty.first
    )
  }

  let(:base_headers) do
    { "ACCEPT" => "application/json", "CONTENT_TYPE" => "application/json" }
  end

  def successful_login
    post "/api/v1/users/sign_in",
      params: { user: { email: user.email, password: user.password } }.to_json,
      headers: base_headers,
      as: :json
    expect(response).to have_http_status(:ok)
    jwt = response.headers["Authorization"]
    expect(jwt).to be_present
    headers = base_headers.merge("Authorization" => jwt)
    return headers
  end

  it "no elimina si no está autenticado" do
    delete "/api/v1/users"
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
    get "/api/v1/users/me"
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
  end

  it "no elimina la cuenta si la contraseña es incorrecta" do
    headers = successful_login
    headers = Devise::JWT::TestHelpers.auth_headers(base_headers, user)
    expect {
      delete "/api/v1/users",
        params: { user: { password: "incorrect" } }.to_json,
        headers: headers,
        as: :json
    }.not_to change(User, :count)

    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
    expect(User.find_by(id: user.id)).to be_present
    expect(JSON.parse(response.body)["error"]).to eq("Contraseña incorrecta")

    get "/api/v1/users/me", headers: headers
    expect(response).to have_http_status(:ok)
    json = response.parsed_body
    payload = json.dig("data", "user") || json["data"] || json["user"] || json
    expect(payload).to be_present
    expect(payload["email"]).to eq(user.email)
  end

  it "elimina la cuenta si la contraseña es correcta" do
    headers = successful_login
    expect {
      delete "/api/v1/users",
        params: { user: { password: user.password } }.to_json,
        headers: headers,
        as: :json
      expect(User.find_by(id: user.id)).to be_nil
    }.to change(User, :count).by(-1)

    expect(response).to have_http_status(:ok)
    expect(User.find_by(id: user.id)).to be_nil
    expect(JSON.parse(response.body)["message"]).to eq("Cuenta eliminada con éxito")

    get "/api/v1/users/me", headers: headers
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
  end
end
