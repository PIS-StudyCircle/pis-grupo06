require File.expand_path('../production.rb', __FILE__)

Rails.application.configure do
  config.log_level = :debug
  config.action_cable.allowed_request_origins = [
    "https://studycircle-frontend-staging.netlify.app"
  ]
  config.action_cable.url = "wss://studycircle-backend-staging-df5d9bd407a6.herokuapp.com/cable"
end