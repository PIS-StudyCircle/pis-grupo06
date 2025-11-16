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

      def create
        build_resource(sign_up_params)

        if resource.save
          if params[:user][:profile_photo].present?
            resource.profile_photo.attach(params[:user][:profile_photo])
          end

          sign_up(resource_name, resource)
          respond_with(resource)
        else
          error_response(
            message: "User couldn't be created successfully.",
            errors: resource.errors.as_json(full_messages: true),
            status: :unprocessable_entity
          )
        end
      end

      private

      def sign_up_params
        params_hash = params.expect(
          user: [:email, :password, :password_confirmation, :name, :last_name, :description, :profile_photo]
        )

        Rails.logger.info "PARAMS: #{params.inspect}"

        fing = Faculty.find_by(name: "Facultad de Ingeniería")

        params_hash[:faculty_id] = fing.id if fing.present?
        params_hash
      end

      def respond_with(resource, _opts = {})
        if resource.persisted?
          success_response(
            message: 'Signed up successfully.',
            data: { user: UserSerializer
            .new(resource, params: { current_user: resource })
            .serializable_hash[:data][:attributes] },
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
        devise_parameter_sanitizer.permit(:sign_up, keys: %i[name last_name description profile_photo])
      end

      def render_bad_request(exception)
        error_response(message: exception.message, status: :bad_request)
      end
    end
  end
end
