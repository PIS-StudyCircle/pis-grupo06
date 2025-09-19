# OmniAuth 2: por defecto solo POST. Habilitamos GET y mantenemos POST.
OmniAuth.config.allowed_request_methods = %i[get post]

# (Opcional) silenciar warning por GET en dev
if Rails.env.development?
  OmniAuth.config.silence_get_warning = true if OmniAuth.config.respond_to?(:silence_get_warning=)
end

# Log a Rails.logger
OmniAuth.config.logger = Rails.logger
