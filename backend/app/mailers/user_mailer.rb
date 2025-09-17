class UserMailer < Devise::Mailer
  include Devise::Controllers::UrlHelpers
  default template_path: "user_mailer"

  def reset_password_instructions(record, token, opts = {})
    @token = token
    @frontend_url = "http://localhost:5173/reset_password?reset_password_token=#{token}"
    super
  end
end

