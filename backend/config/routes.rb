Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      devise_for :users,
        defaults: { format: :json },
        controllers: {
          sessions: 'api/v1/users/sessions',
          registrations: 'api/v1/users/registrations',
        }

      get "up", to: proc { [200, {}, ['OK']] }
    end
  end
end

