class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers
  include JsonResponse
  include ActionController::Cookies

  protected

  scope = Devise.mappings.keys.first

  if scope && scope != :user
    define_method(:authenticate_user!) { send(:"authenticate_#{scope}!") }
    define_method(:current_user)       { send(:"current_#{scope}") }
    define_method(:user_signed_in?)    { send(:"#{scope}_signed_in?") }
  end
end
