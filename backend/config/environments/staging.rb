require File.expand_path('../production.rb', __FILE__)

Rails.application.configure do
  config.log_level = :debug
end
