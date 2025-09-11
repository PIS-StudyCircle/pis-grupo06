# frozen_string_literal: true

module Api
  module V1
    class Users::RegistrationsController < Devise::RegistrationsController
      respond_to :json

      skip_before_action :authenticate_user!, only: [:create], raise: false
      before_action :configure_sign_up_params, only: [:create]
      rescue_from ActionController::ParameterMissing, with: :render_bad_request

      private

      def sign_up_params
        params_hash = params.expect(
          user: [:email, :password, :password_confirmation,
                 :name, :last_name, :description]
        )

        # Por ahora los estudiantes siempre son de la Fing, UDELAR
        fing = Faculty.find_by(name: "Facultad de Ingeniería")
        params_hash[:faculty_id] = fing.id if fing.present?

        params_hash
      end

      def respond_with(resource, _opts = {})
        if resource.persisted?
          token = request.env['warden-jwt_auth.token']
          headers['Authorization'] = "Bearer #{token}" if token.present?

          render json: {
            status: 201,
            message: 'Signed up successfully.',
            token: token, # opcional: también lo devolvemos en body
            data: serialized_user(resource)
          }, status: :created
        else
          render json: {
            status: 422,
            message: "User couldn't be created successfully.",
            errors: resource.errors.as_json(full_messages: true)
          }, status: :unprocessable_entity
        end
      end

      protected

      def configure_sign_up_params
        devise_parameter_sanitizer.permit(
          :sign_up,
          keys: %i[name last_name description]
        )
      end

      def serialized_user(user)
        UserSerializer.new(user).serializable_hash[:data].slice(:id, :type, :attributes)
      end

      def render_bad_request(exception)
        render json: { status: 400, message: exception.message }, status: :bad_request
      end
    end
  end
end
