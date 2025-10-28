require 'ostruct'
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

  has_many :given_reviews,
           class_name: "UserReview",
           foreign_key: "reviewer_id",
           inverse_of: :reviewer,
           dependent: :destroy

  has_many :received_reviews,
           class_name: "UserReview",
           foreign_key: "reviewed_id",
           inverse_of: :reviewed,
           dependent: :destroy

  has_many :given_feedbacks,
           class_name: "Feedback",
           foreign_key: "student_id",
           inverse_of: :student,
           dependent: :destroy

  has_many :received_feedbacks,
           class_name: "Feedback",
           foreign_key: "tutor_id",
           inverse_of: :tutor,
           dependent: :destroy

  belongs_to :faculty

  has_one_attached :profile_photo
  has_many :notifications, as: :recipient, class_name: "Noticed::Notification", dependent: :destroy
  has_many :notification_mentions, as: :record, class_name: "Noticed::Event", dependent: :destroy

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
    else
      user.provider ||= auth.provider
      user.uid      ||= auth.uid
      user.name     ||= auth.info.first_name || auth.info.name
      user.last_name ||= auth.info.last_name
    end

    # Guardar credenciales de Google
    creds = auth.credentials || OpenStruct.new
    user.google_access_token  = creds.token
    user.google_refresh_token = creds.refresh_token || user.google_refresh_token
    user.google_expires_at    = Time.zone.at(creds.expires_at) if creds.expires_at

    user.save!
    user
  end

  def devise_mailer
    UserMailer
  end
end
