# frozen_string_literal: true

module Api
  module V1
    class Users::SessionsController < Devise::SessionsController
      include ActionController::Cookies
      include ActionController::RequestForgeryProtection
      include AuthCookies

      respond_to :json

      skip_forgery_protection
      after_action :stash_jwt_and_csrf_cookies, only: :create
      after_action :clear_auth_cookies, only: :destroy

      private

      def respond_with(resource, _opt = {})
        # Solo procesar Google Calendar si el usuario tiene OAuth configurado
        if resource.google_refresh_token.present?
          setup_google_calendar(resource)
        end

        success_response(
          message: 'Logged in successfully.',
          data: { user: UserSerializer.new(resource).serializable_hash[:data][:attributes] },
          status: :ok
        )
      end

      def respond_to_on_destroy
        success_response(message: 'Logged out successfully.', status: :ok)
      end

      def setup_google_calendar(user)
        service = GoogleCalendarService.new(user)
        service.ensure_calendar
      rescue Google::Auth::AuthorizationError => e
        Rails.logger.error "Error configurando Google Calendar: #{e.message}"
        # No fallar el login si hay problemas con Google Calendar
      end
    end
  end
end
