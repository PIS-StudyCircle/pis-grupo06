Rails.application.routes.draw do
  namespace :api do 
    get "users/profiles", to: "users#profile"
    namespace :v1 do
      devise_for :users,
                 defaults: { format: :json },
                 controllers: {
                   sessions: 'api/v1/users/sessions',
                   registrations: 'api/v1/users/registrations',
                 }

      get "up", to: proc { [200, {}, ['OK']] }

      namespace :users do
        get :me, to: 'me#show'
      end

      resources :courses
    end
  end
end
