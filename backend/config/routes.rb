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
        
        resources :user_reviews, only: [:create, :index] do
          collection do
            get :can_review
          end
        end
      end

      # index y show de UsersController
      resources :users, module: :users, only: [:index, :show]

      resources :courses do
        resources :subjects
      end
      resources :tutorings
    end
  end
end
