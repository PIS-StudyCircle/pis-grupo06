module Api
  module V1
    module Users
      class PasswordValidationsController < ApplicationController
        before_action :authenticate_user!

        def create
          if current_user.valid_password?(params.dig(:user, :password))
            render json: { message: "Contraseña válida." }, status: :ok
          else
            render json: { error: "La contraseña es incorrecta." }, status: :unauthorized
          end
        end
      end
    end
  end
end
