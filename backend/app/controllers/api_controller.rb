class ApiController < ApplicationController
  def ping
    render json: { message: "pong 🏓", time: Time.current }
  end
end
