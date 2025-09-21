class UserMailer < Devise::Mailer
  include Devise::Controllers::UrlHelpers

  default template_path: "user_mailer"
  default from: "StudyCircle <studycircle.project@gmail.com>"

  def reset_password_instructions(record, token, opts = {})
    @token = token
    @frontend_url = "http://localhost:5173/restablecer_contrasena?reset_password_token=#{token}"
    opts[:subject] = "StudyCircle - Restablecer tu contraseña"
    super
  end
end
