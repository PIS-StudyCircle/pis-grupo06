Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      devise_for :users,
                 defaults: { format: :json },
                 controllers: {
                   sessions: 'api/v1/users/sessions',
                   registrations: 'api/v1/users/registrations',
                   passwords: 'api/v1/users/passwords',
                   omniauth_callbacks: 'api/v1/users/omniauth_callbacks'
                 }

      get "up", to: proc { [200, {}, ['OK']] }
      namespace :users do
        get :me, to: 'me#show'
      end

      # index y show de UsersController
      resources :users, module: :users, only: [:index, :show]

      resources :courses
      resources :subjects
      resources :tutorings

      namespace :calendar do
        resources :sessions, only: [:index, :create, :destroy]
      end
    end
  end
end
