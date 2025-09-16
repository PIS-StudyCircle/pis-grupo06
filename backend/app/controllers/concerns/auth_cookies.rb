# frozen_string_literal: true

module AuthCookies
  extend ActiveSupport::Concern

  private

  def stash_jwt_and_csrf_cookies
    token = request.env['warden-jwt_auth.token']
    return if token.blank?

    set_auth_cookies(token)

    response.headers.delete('Authorization')
  end

  def clear_auth_cookies
    cookies.delete(:jwt, secure: Rails.env.production?, same_site: :none)
    cookies.delete(:csrf_token, secure: Rails.env.production?, same_site: :none)
  end

  def set_auth_cookies(token)
    cookies.encrypted[:jwt] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :none,
      expires: 7.days.from_now
    }
    cookies[:csrf_token] = {
      value: SecureRandom.base64(32),
      httponly: false,
      secure: Rails.env.production?,
      same_site: :none,
      expires: 7.days.from_now
    }
  end
end
