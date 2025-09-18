module Api
  module V1
    module Users
      class OmniauthCallbacksController < Devise::OmniauthCallbacksController
        include ActionController::Cookies
        include ActionController::RequestForgeryProtection
        include AuthCookies

        skip_forgery_protection

        def google_oauth2
          Rails.logger.info "[OA] callback session_id=#{request.session.id} probe=#{session[:oauth_probe]}"
          auth  = request.env['omniauth.auth']
          user  = User.from_omniauth(auth)

          token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

          write_auth_cookies(token)
          sign_in(user)

          redirect_to success_redirect_url, allow_other_host: true
        rescue => e
          Rails.logger.error("[OAuth] Google error: #{e.class}: #{e.message}")
          redirect_to failure_redirect_url(error: 'oauth_failed')
        end

        def failure
          error = request.params['error'] || 'unknown_error'
          Rails.logger.error("[OAuth] Failure callback invoked: #{error}")

          redirect_to failure_redirect_url(error: 'oauth_denied'), allow_other_host: true
        end

        private

        def success_redirect_url
          ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')
        end

        def failure_redirect_url(error: nil)
          base = ENV.fetch('FRONTEND_FAILURE_URL', 'http://localhost:5173/iniciar_sesion')
          error ? "#{base}?error=#{CGI.escape(error)}" : base
        end
      end
    end
  end
end
