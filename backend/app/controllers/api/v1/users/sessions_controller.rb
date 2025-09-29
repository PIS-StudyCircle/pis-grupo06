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
        return user.study_circle_calendar_id if user.study_circle_calendar_id.present?

        calendar = Google::Apis::CalendarV3::Calendar.new(
          summary: "StudyCircle",
          description: "Calendario dedicado a las tutorías de StudyCircle",
          time_zone: "America/Montevideo"
        )

        result = service.insert_calendar(calendar)
        user.update!(study_circle_calendar_id: result.id)

        result.id
      end
    end
  end
end
