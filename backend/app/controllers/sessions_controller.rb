class SessionsController < ApplicationController
  def create
    auth = request.env['omniauth.auth']
    user = User.find_or_create_by(email: auth['info']['email']) do |u|
      u.name = auth['info']['name']
      u.password = SecureRandom.hex(15)  # contraseña random porque no vamos a usar
    end

    session[:user_id] = user.id
    redirect_to root_path, notice: "Logged in as #{user.name}"
  end
end

