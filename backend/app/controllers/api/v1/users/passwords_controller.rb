module Api
  module V1
    module Users
      class PasswordsController < Devise::PasswordsController
        wrap_parameters false
        respond_to :json

        # -> envía email con link para reset
        def create
          self.resource = resource_class.send_reset_password_instructions(resource_params)
          if successfully_sent?(resource)
            render json: { message: "Se envió un email con instrucciones para restablecer tu contraseña" }, status: :ok
          else
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # -> restablece la contraseña con el token
        def update
          token = resource_params[:reset_password_token]
          password = resource_params[:password]

          user = resource_class.with_reset_password_token(token)
          if user.nil?
            return render json: { errors: ["El enlace de restablecimiento es inválido o ya ha sido utilizado."] }, status: :unprocessable_entity
          end

          # Verificar si la nueva contraseña es igual a la actual.
          if user.valid_password?(password)
            user.errors.add(:password, :same_as_current, message: "no puede ser igual a la contraseña actual")
            return render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end

          self.resource = resource_class.reset_password_by_token(resource_params)

          if resource.errors.empty?
            sign_in(resource_name, resource)
            token, _payload = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil)
            render json: {
              message: "Contraseña actualizada correctamente.",
              user: UserSerializer.new(resource),
              token: token
            }, status: :ok
          else
            # Esto captura otros errores de Devise (ej: contraseña muy corta).
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def resource_params
          params.expect(user: [:email, :password, :password_confirmation, :reset_password_token])
        end

        def respond_with(resource, _opts = {})
          render json: resource
        end
      end
    end
  end
end
