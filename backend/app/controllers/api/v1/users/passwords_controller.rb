module Api
  module V1
    module Users
      class PasswordsController < Devise::PasswordsController
        respond_to :json

        # POST /api/v1/users/password
        # -> envía email con link para reset
        def create
          self.resource = resource_class.send_reset_password_instructions(resource_params)
          if successfully_sent?(resource)
            render json: { message: "Se envió un email con instrucciones para restablecer tu contraseña" }, status: :ok
          else
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PUT /api/v1/users/password
        # -> restablece la contraseña con el token
        def update
          self.resource = resource_class.reset_password_by_token(resource_params)
          if resource.errors.empty?
            render json: { message: "Contraseña actualizada correctamente" }, status: :ok
          else
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def resource_params
          params.require(:user).permit(:email, :password, :password_confirmation, :reset_password_token)
        end

        
        private

        def respond_with(resource, _opts = {})
          render json: resource
        end
      end
    end
  end
end
