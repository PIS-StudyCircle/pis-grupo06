class JwtCookieToAuthorization
  def initialize(app) = @app = app

  def call(env)
    if env['HTTP_AUTHORIZATION'].to_s.strip.empty?
      jwt = Rack::Request.new(env).cookies['jwt']
      env['HTTP_AUTHORIZATION'] = "Bearer #{jwt}" if jwt.present?
    end
    @app.call(env)
  end
end
