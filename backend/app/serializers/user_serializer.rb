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
    current_user = params[:current_user]

    if current_user && user.id == current_user.id
      user.email
    else
      user.email_masked
    end
  end
end
