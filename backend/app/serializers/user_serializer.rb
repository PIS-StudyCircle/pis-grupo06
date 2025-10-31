class UserSerializer
  include JSONAPI::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :email, :name, :last_name, :description, :created_at, :updated_at

  attribute :profile_photo_url do |user|
    if user.profile_photo.attached?
      Rails.application.routes.url_helpers.url_for(user.profile_photo)
    else
      nil
    end
  end
  
  attribute :email do |user, params|
    mask = params&.fetch(:mask_email, true) # por defecto true
    mask ? user.email_masked : user.email
  end
end
