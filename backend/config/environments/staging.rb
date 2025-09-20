require File.expand_path('../production.rb', __FILE__)

Rails.application.configure do
  config.log_level = :debug

  # Set host to be used by links generated in mailer templates.
  config.action_mailer.default_url_options = { host: "studycircle-frontend-staging.netlify.app"}

  # Cómo se entregan los mails 
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
  address:              "smtp.gmail.com",
  port:                 587,
  domain:               "gmail.com",
  user_name:            "studycircle.project@gmail.com", 
  password:             ENV["SMTP_PASS"],        # acá va el app password
  authentication:       "plain",
  enable_starttls_auto: true
}

end
