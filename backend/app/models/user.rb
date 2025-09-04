class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]

  def self.from_google_oauth(auth)
    # Si ya hay un usuario con ese provider/uid, lo usa
    user = find_or_initialize_by(provider: "google", uid: auth.uid)

    # Si es nuevo y ya existe uno con el mismo email, lo “enlazamos” a Google
    if user.new_record? && (existing = find_by(email: auth.info.email))
      existing.update!(provider: "google", uid: auth.uid)
      return existing
    end

    # user.email = auth.info.email
    # user.name  = auth.info.name.presence || auth.info.first_name

    full_name = (auth.info.name.presence || auth.info.first_name).to_s.strip

    # separar en primera palabra + resto (todos los intermedios van al "resto")
    first, *rest = full_name.split(/\s+/)
    last = rest.join(" ")

    # fallbacks por si Google no trae algo y DB exige NOT NULL en last_name
    first ||= auth.info.first_name.presence || auth.info.email.to_s.split("@").first
    last  =  (auth.info.last_name.presence || last).presence || "Google"

    # asignaciones (solo si esas columnas existen en tu tabla)
    user.email = auth.info.email if user.has_attribute?(:email)
    user.name       = first if user.has_attribute?(:name)
    user.last_name  = last  if user.has_attribute?(:last_name)

    # Con Devise + validatable, en alta necesitás password
    user.password ||= Devise.friendly_token[0, 20]

    user.save!
    user
  end         
end

