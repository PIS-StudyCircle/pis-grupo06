require 'rails_helper'

RSpec.describe "Api::Users", type: :request do
  describe "GET /profiles" do
    it "returns http success" do
      get "/api/users/profiles"
      expect(response).to have_http_status(:success)
    end
  end

end
