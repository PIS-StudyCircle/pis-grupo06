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


      resources :courses do
        resources :subjects
      end
      resources :tutorings

      resource :calendar, only: [] do
        post   "sessions",          to: "calendar#create"
        post   "sessions/:id/join", to: "calendar#join"
        get    "sessions/upcoming", to: "calendar#upcoming"
        get    "sessions/:id",      to: "calendar#show"
        delete "sessions/:id",      to: "calendar#destroy"
      end
    end
  end
end
