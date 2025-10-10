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
        resources :favorite_courses, only: [:index], controller: 'favorite_courses'
      end

      # index y show de UsersController
      resources :users, module: :users, only: [:index, :show]

      resources :courses do
        resources :subjects
        resource :favorite, only: [:create, :destroy], controller: 'course_favorites'
      end
      resources :tutorings
      resources :subjects
    end
  end
end
