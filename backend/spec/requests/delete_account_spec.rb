require 'rails_helper'

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

  let(:json_headers) do
    {
      "ACCEPT" => "application/json",
      "CONTENT_TYPE" => "application/json"
    }
  end

  def successful_login
    post "/api/v1/users/sign_in",
         params: { api_v1_user: { email: user.email, password: user.password } },
         as: :json
    expect(response).to have_http_status(:ok)
  end

  it "no elimina si no está autenticado" do
    delete "/api/v1/users"
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
  end

  it "no elimina la cuenta si la contraseña es incorrecta" do
    successful_login
    expect {
      delete "/api/v1/users",
        params: { password: "incorrect" },
        as: :json
    }.not_to change(User, :count)

    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
    expect(User.find_by(id: user.id)).to be_present

    get "/api/v1/users/me"
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["email"]).to eq(user.email)
  end

  it "elimina la cuenta si la contraseña es correcta" do
    successful_login
    expect {
      delete "/api/v1/users",
        params: { password: user.password },
        as: :json
    }.to change(User, :count).by(-1)

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["message"]).to eq("Cuenta eliminada con éxito")
    expect(User.find_by(id: user.id)).to be_nil

    get "/api/v1/users/me"
    expect(response).to have_http_status(:unauthorized).or have_http_status(:found)
  end
end
