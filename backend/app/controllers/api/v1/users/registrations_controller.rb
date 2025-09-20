# frozen_string_literal: true

module Api
  module V1
    class Users::RegistrationsController < Devise::RegistrationsController
      include ActionController::Cookies
      include ActionController::RequestForgeryProtection
      include AuthCookies

      respond_to :json

      skip_forgery_protection
      before_action :configure_sign_up_params, only: [:create]
      after_action :stash_jwt_and_csrf_cookies, only: :create, if: -> { resource.persisted? }
      rescue_from ActionController::ParameterMissing, with: :render_bad_request

      def destroy
        unless current_user
          render json: { error: "No autenticado" }, status: :unauthorized and return
        end

        unless current_user.valid_password?(params.dig(:user, :password))
          render json: { error: "Contraseña incorrecta" }, status: :unauthorized and return
        end

        current_user.destroy
        Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
        render json: { message: "Cuenta eliminada con éxito" }, status: :ok
      end

      private

      def sign_up_params
        params_hash = params.expect(
          user: [:email, :password, :password_confirmation, :name, :last_name, :description]
        )

        fing = Faculty.find_by(name: "Facultad de Ingeniería")

        params_hash[:faculty_id] = fing.id if fing.present?
        params_hash
      end

      def respond_with(resource, _opts = {})
        if resource.persisted?
          success_response(
            message: 'Signed up successfully.',
            data: { user: UserSerializer.new(resource).serializable_hash[:data][:attributes] },
            status: :created
          )
        else
          error_response(
            message: "User couldn't be created successfully.",
            errors: resource.errors.as_json(full_messages: true),
            status: :unprocessable_entity
          )
        end
      end

      protected

      def configure_sign_up_params
        devise_parameter_sanitizer.permit(:sign_up, keys: %i[name last_name description])
      end

      def render_bad_request(exception)
        error_response(message: exception.message, status: :bad_request)
      end
    end
  end
end
