class Tutoring < ApplicationRecord
  has_many :user_tutorings, dependent: :destroy
  has_many :users, through: :user_tutorings

  has_many :subject_tutorings, dependent: :destroy
  has_many :subjects, through: :subject_tutorings

  belongs_to :course
  belongs_to :creator, class_name: 'User',
                       foreign_key: 'created_by_id',
                       optional: true,
                       inverse_of: :created_tutorings
  belongs_to :tutor, class_name: 'User', optional: true

  # Tutorías en las que un usuario está inscripto
  scope :enrolled_by, ->(user) {
    return none if user.blank?

    joins(:user_tutorings).where(user_tutorings: { user_id: user.id })
  }

  # Tutorías filtradas por id de materia (course_id)
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

  scope :search_by_course_name, ->(q) {
    return all if q.blank?
    joins(:course).where("courses.name ILIKE ?", "%#{q}%")
  }

  scope :search_by_subject_name, ->(q) {
    return all if q.blank?
    left_joins(:subjects).where("subjects.name ILIKE ?", "%#{q}%").distinct
  }

  scope :search_by_modality, ->(q) {
    return all if q.blank?
    where("tutorings.modality ILIKE ?", "%#{q}%")
  }

  # --- Validaciones ---
  validate :scheduled_at_cannot_be_in_past

  validates :duration_mins,
            numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 240 }

  validates :modality,
            presence: true,
            inclusion: { in: %w[virtual presencial],
                         message: :inclusion }

  validates :capacity,
            presence: true,
            numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 100 }
  validate :capacity_not_less_than_enrolled

  # --- Métodos auxiliares ---

  def enrolled
    user_tutorings.size
  end

  private

  def scheduled_at_cannot_be_in_past
    return if scheduled_at.blank?

    if scheduled_at < Time.current
      errors.add(:scheduled_at, :past)
    end
  end

  def capacity_not_less_than_enrolled
    return if capacity.blank?

    if enrolled > capacity
      errors.add(:capacity, :less_than_enrolled)
    end
  end
end
