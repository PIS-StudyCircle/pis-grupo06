Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV.fetch("GOOGLE_CLIENT_ID"),
           ENV.fetch("GOOGLE_CLIENT_SECRET"),
           {
             scope: "email,profile",
             prompt: "select_account",
             access_type: "offline"
           }
end

# OmniAuth 2: por defecto solo POST. Habilitamos GET y mantenemos POST.
OmniAuth.config.allowed_request_methods = %i[get post]

# (Opcional) silenciar warning por GET en dev
if Rails.env.development?
  OmniAuth.config.silence_get_warning = true if OmniAuth.config.respond_to?(:silence_get_warning=)
end

# Log a Rails.logger
OmniAuth.config.logger = Rails.logger

