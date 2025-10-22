require_relative "boot"

require "rails/all"
require_relative "../lib/jwt_cookie_to_authorization"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Backend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0
    config.time_zone = 'America/Montevideo'
    config.active_record.default_timezone = :utc

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    config.i18n.available_locales = [:es, :en]
    config.i18n.default_locale = :es

    config.to_prepare do
      Noticed::Notification.include Noticed::NotificationExtensions
    end

    config.paths.add "app/channels", eager_load: true

    require "action_cable/engine"

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true
    # Enabled the session store for api_only application
    config.middleware.insert_before 0, ActionDispatch::Cookies

    # 2) Sesión inmediatamente después de Cookies (definimos opciones acá mismo)
    non_prod_envs = %w[development test]

    config.middleware.insert_after ActionDispatch::Cookies,
                                   ActionDispatch::Session::CookieStore,
                                   key: '_app_session',
                                   same_site: :lax,
                                   secure: !Rails.env.in?(non_prod_envs)

    # 3) Tu middleware JWT DESPUÉS de que existan cookies+sesión
    config.middleware.insert_after ActionDispatch::Session::CookieStore, JwtCookieToAuthorization

    # Nada más acá. No insertes estrategias OmniAuth ni otro CookieStore en otro archivo.
    
    # Configure ActiveJob to use Sidekiq
    config.active_job.queue_adapter = :sidekiq
  end
end
