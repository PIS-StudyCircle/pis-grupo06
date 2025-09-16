class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :name, :last_name, :description, :created_at, :updated_at
end
