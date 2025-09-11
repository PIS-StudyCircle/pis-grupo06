class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable,
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
end
