# frozen_string_literal: true

module Api
  module V1
    class Users::SessionsController < Devise::SessionsController
      respond_to :json

      private

      def respond_with(resource, _opt = {})
        token = request.env['warden-jwt_auth.token']
        headers['Authorization'] = "Bearer #{token}" if token.present?

        data = {
          token:,
          user: UserSerializer.new(resource).serializable_hash[:data][:attributes]
        }

        success_response(
          message: 'Logged in successfully.',
          data:,
          status: :ok
        )
      end

      def respond_to_on_destroy
        if request.headers['Authorization'].present?
          jwt_payload = JWT.decode(
            request.headers['Authorization'].split.last,
            Rails.application.credentials.devise_jwt_secret_key!
          ).first

          current_user = User.find(jwt_payload['sub'])
        end

        if current_user
          success_response(
            message: 'Logged out successfully.',
            status: :ok
          )
        else
          error_response(
            message: "Couldn't find an active session.",
            status: :unauthorized
          )
        end
      end
    end
  end
end
