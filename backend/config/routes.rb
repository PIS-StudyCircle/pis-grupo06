Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      mount ActionCable.server => "/cable"

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

        resources :user_reviews, only: [:create, :index, :update, :destroy] do
          collection do
            get :can_review
          end
        end
      end

      post "/notification_token", to: "notification_tokens#create"

      # index y show de UsersController
      resources :users, module: :users, only: [:index, :show]

      resources :courses do
        resources :subjects
        resource :favorite, only: [:create, :destroy], controller: 'course_favorites'
      end
      resources :tutorings
      resources :notifications do
        collection do
          post :mark_all_read
          post :mark_all_seen
          delete :destroy_all
        end

        member do
          post :mark_as_read
        end
      end
    end
  end
end
