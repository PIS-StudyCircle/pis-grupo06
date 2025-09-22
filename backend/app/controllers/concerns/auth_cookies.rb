# frozen_string_literal: true

module AuthCookies
  extend ActiveSupport::Concern

  private

  def stash_jwt_and_csrf_cookies
    token = request.env['warden-jwt_auth.token']
    return if token.blank?

    write_auth_cookies(token)

    response.headers.delete('Authorization')
  end

  def clear_auth_cookies
    cookies.delete(:jwt, secure: secure_cookies?, same_site: :lax)
    cookies.delete(:csrf_token, secure: secure_cookies?, same_site: :lax)
  end

  def write_auth_cookies(token)
    cookies[:jwt] = {
      value: token,
      httponly: true,
      secure: secure_cookies?,
      same_site: :lax,
      expires: 7.days.from_now
    }
    cookies[:csrf_token] = {
      value: SecureRandom.base64(32),
      httponly: false,
      secure: secure_cookies?,
      same_site: :lax,
      expires: 7.days.from_now
    }
  end

  def secure_cookies?
    non_prod_envs = %w[development test]

    !Rails.env.in?(non_prod_envs)
  end
end
