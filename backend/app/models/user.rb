class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable,
         :omniauthable, omniauth_providers: [:google_oauth2],
         jwt_revocation_strategy: self

  # tutorías como asistente o tutor
  has_many :user_tutorings, dependent: :destroy
  has_many :tutorings, through: :user_tutorings

  # favoritos
  has_many :favorite_courses, dependent: :destroy
  has_many :favorite_courses_list, through: :favorite_courses, source: :course

  # temas creados
  has_many :created_subjects,
           class_name: "Subject",
           foreign_key: "creator_id",
           inverse_of: :creator,
           dependent: :nullify

  belongs_to :faculty

  # validaciones
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :last_name, presence: true
  validates :password_confirmation, presence: true, on: :create
  validates :description, length: { maximum: 500 }, allow_blank: true


  def self.from_omniauth(auth)
    # auth.info: { email, first_name, last_name, ... }
    user = find_or_initialize_by(provider: auth.provider, uid: auth.uid)

    if user.new_record?
      user.email = auth.info.email
      user.name  = auth.info.first_name.presence || auth.info.name
      user.last_name = auth.info.last_name
      user.password = Devise.friendly_token[0, 32]
      user.skip_confirmation! if user.respond_to?(:skip_confirmation!)
      user.save!
    else
      # opcional: actualizar nombre/apellido si cambiaron
      user.update(
        name: user.name.presence || auth.info.first_name || auth.info.name,
        last_name: user.last_name.presence || auth.info.last_name
      )
    end

    user
  end
end
