Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      mount ActionCable.server => "/cable"

      post "dev/cable_test", to: "dev#cable_test" if Rails.env.development?
      post "dev/notify_test", to: "dev#notify_test" if Rails.env.development?

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
        resources :user_feedbacks, only: [:index, :create, :destroy] do
          collection do
            get :check
            get :top_rated
          end
        end
      end

      post "/notification_token", to: "notification_tokens#create"

      # index y show de UsersController

      resources :users, module: :users, only: [:index, :show, :update]
      put "/users/upload_photo", to: "users/users#update_profile_photo"
      get "/users/:id/profile_photo", to: "users/users#profile_photo"

      resources :courses do
        resources :subjects
        resource :favorite, only: [:create, :destroy], controller: 'course_favorites'
      end

      resources :tutorings do
        get "upcoming", on: :collection
        get "past", on: :collection
        post "confirm_schedule", on: :member
        post "join_tutoring", on: :member
        get "exists_user_tutoring", on: :member
        delete "unsubscribe", on: :member
      end

      # chat de tutoria
      resources :chats, only: [:index, :create, :show, :destroy] do
        post :mark_read, on: :member

        resources :messages, only: [:index, :create]
      end

      resource :calendar, only: [] do
        post   "sessions",          to: "calendar#create"
        post   "sessions/:id/join", to: "calendar#join"
        get    "sessions/upcoming", to: "calendar#upcoming"
        get    "sessions/:id",      to: "calendar#show"
        delete "sessions/:id",      to: "calendar#destroy"
      end

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
      post 'avatars/create', to: 'avatars#create'
      post 'avatars/edit', to: 'avatars#edit'
    end
  end
end
