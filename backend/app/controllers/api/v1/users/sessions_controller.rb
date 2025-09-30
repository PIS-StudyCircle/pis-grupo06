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
      service = Google::Apis::CalendarV3::CalendarService.new
      service.authorization = resource.google_access_token || refresh_google_token(resource)

      ensure_study_circle_calendar(resource, service)

        success_response(
          message: 'Logged in successfully.',
          data: { user: UserSerializer.new(resource).serializable_hash[:data][:attributes] },
          status: :ok
        )
      end

      def respond_to_on_destroy
        success_response(message: 'Logged out successfully.', status: :ok)
      end
      
      # Para crear el calendario de StudyCircle si no existe
      def ensure_study_circle_calendar(user, service)
        return user.calendar_id if user.calendar_id.present?

        calendar = Google::Apis::CalendarV3::Calendar.new(
          summary: "StudyCircle",
          description: "Calendario dedicado a las tutorías de StudyCircle",
          time_zone: "America/Montevideo"
        )

        result = service.insert_calendar(calendar)
        user.update!(study_circle_calendar_id: result.id)

        result.id
      end

      def refresh_google_token(user)
        client = Signet::OAuth2::Client.new(
          client_id: ENV['GOOGLE_CLIENT_ID'],
          client_secret: ENV['GOOGLE_CLIENT_SECRET'],
          token_credential_uri: 'https://oauth2.googleapis.com/token',
          refresh_token: user.google_refresh_token,
        )

        client.fetch_access_token!

        user.update!(
          google_access_token: client.access_token,
          google_expires_at: Time.now + client.expires_in
        )

        client.access_token
      end
    end
  end
end
