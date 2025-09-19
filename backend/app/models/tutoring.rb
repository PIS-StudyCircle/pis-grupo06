class Tutoring < ApplicationRecord
  has_many :user_tutorings, dependent: :destroy
  has_many :users, through: :user_tutorings

  has_many :subject_tutorings, dependent: :destroy
  has_many :subjects, through: :subject_tutorings

  belongs_to :course
  belongs_to :creator, class_name: 'User', foreign_key: 'created_by_id', optional: true, inverse_of: :created_tutorings
  belongs_to :tutor, class_name: 'User', optional: true

  # Tutorías en las que un usuario está inscripto
  scope :enrolled_by, ->(user) {
    return none if user.blank?

    left_joins(:user_tutorings).where(user_tutorings: { user_id: user.id })
  }

  # Tutorías filtradas por id de curso
  scope :with_course_id, ->(id) {
    joins(:course).where(courses: { id: id }) if id.present?
  }

  # Tutorías filtradas por id de curso
  scope :by_course_id, ->(id) {
    where(course_id: id)
  }

  # Tutorías creadas por un usuario específico
  scope :created_by, ->(user_id) {
    where(created_by_id: user_id) if user_id.present?
  }

  # Tutorías sin tutor asignado
  scope :without_tutor, -> {
    where(tutor_id: nil)
  }

  # Ya pasó (scheduled_at < ahora)
  scope :past, -> { where(scheduled_at: ...Time.current) }

  # Futuras (scheduled_at >= ahora)
  scope :upcoming, -> { where(scheduled_at: Time.current..) }
end
