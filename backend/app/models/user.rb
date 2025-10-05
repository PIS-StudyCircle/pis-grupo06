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

  # tutorías creadas
  has_many :created_tutorings,
           class_name: 'Tutoring',
           foreign_key: 'created_by_id',
           inverse_of: :creator,
           dependent: :nullify

  belongs_to :faculty

  # validaciones
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :last_name, presence: true
  validates :password_confirmation, presence: true, on: :create
  validates :description, length: { maximum: 500 }, allow_blank: true

  scope :tutors, -> {
    where(id: Tutoring.select(:tutor_id).distinct)
  }

  def self.from_omniauth(auth)
    user = find_by(provider: auth.provider, uid: auth.uid) || find_by(email: auth.info.email)

    if user.nil?
      user = User.new
      user.provider = auth.provider
      user.uid = auth.uid

      fing = Faculty.find_by(name: "Facultad de Ingeniería")
      user.faculty = fing if fing.present?

      user.email = auth.info.email
      user.name  = auth.info.first_name.presence || auth.info.name
      user.last_name = auth.info.last_name

      password = Devise.friendly_token[0, 32]
      user.password = password
      user.password_confirmation = password

      user.save!
    else
      user.update(
        name: user.name.presence || auth.info.first_name || auth.info.name,
        last_name: user.last_name.presence || auth.info.last_name,
        provider: auth.provider,
        uid: auth.uid
      )
    end

    user
  end

  def devise_mailer
    UserMailer
  end
end
