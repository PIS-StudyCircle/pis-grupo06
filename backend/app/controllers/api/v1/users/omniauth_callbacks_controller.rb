# app/controllers/api/v1/users/omniauth_callbacks_controller.rb
module Api
  module V1
    module Users
      class OmniauthCallbacksController < Devise::OmniauthCallbacksController
        include ActionController::Cookies
        include ActionController::RequestForgeryProtection
        include AuthCookies

        skip_forgery_protection # viene por redirect de Google (GET)

        def google_oauth2
          auth  = request.env['omniauth.auth']
          user  = User.from_omniauth(auth)

          # Firmar y generar JWT (porque devise-jwt no dispatcha en este GET)
          # scope = :user (usa tu scope real si cambiaste)
          token, _payload = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)

          set_auth_cookies(token)
          sign_in(user) # opcional si necesitás recursos de Devise

          redirect_to success_redirect_url
        rescue => e
          Rails.logger.error("[OAuth] Google error: #{e.class}: #{e.message}")
          redirect_to failure_redirect_url(error: 'oauth_failed')
        end

        def failure
          redirect_to failure_redirect_url(error: 'oauth_denied')
        end

        private

        def success_redirect_url
          ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')
        end

        def failure_redirect_url(error: nil)
          base = ENV.fetch('FRONTEND_FAILURE_URL', 'http://localhost:5173/sign_in')
          error ? "#{base}?error=#{CGI.escape(error)}" : base
        end
      end
    end
  end
end
