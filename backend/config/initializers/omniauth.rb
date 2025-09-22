OmniAuth.config.allowed_request_methods = %i[get]

if Rails.env.development?
  OmniAuth.config.silence_get_warning = true if OmniAuth.config.respond_to?(:silence_get_warning=)
end

OmniAuth.config.logger = Rails.logger

OmniAuth.config.full_host = ->(env) {
  scheme = env["HTTP_X_FORWARDED_PROTO"] || env["rack.url_scheme"] || "http"
  host   = env["HTTP_X_FORWARDED_HOST"]  || env["HTTP_HOST"]
  "#{scheme}://#{host}"
}
