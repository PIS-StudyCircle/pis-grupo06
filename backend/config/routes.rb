Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      devise_for :users,
                 defaults: { format: :json },
                 controllers: {
                   sessions: 'api/v1/users/sessions',
                   registrations: 'api/v1/users/registrations',
                   omniauth_callbacks: 'api/v1/users/omniauth_callbacks'
                 }

      get "up", to: proc { [200, {}, ['OK']] }
      namespace :users do
        get :me, to: 'me#show'
      end

      resources :courses
      resources :tutorings

      namespace :calendar do
        resources :sessions, only: [:index, :create]
      end
    end
  end
end
