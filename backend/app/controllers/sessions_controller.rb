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

  def omniauth
    auth = request.env["omniauth.auth"] # hash con info de Google
    user = User.from_google_oauth(auth)
    reset_session
    session[:user_id] = user.id
    redirect_to ENV.fetch("FRONTEND_ORIGIN") # esto tendría que llevar al home del usuario después
  end

  def failure
    render json: { error: params[:message] || "oauth_failed" }, status: :unauthorized
  end
end

