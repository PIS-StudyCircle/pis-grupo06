class Tutoring < ApplicationRecord
  has_many :user_tutorings, dependent: :destroy
  has_many :users, through: :user_tutorings

  has_many :subject_tutorings, dependent: :destroy
  has_many :subjects, through: :subject_tutorings

  has_many :tutoring_availabilities, dependent: :destroy

  belongs_to :course
  belongs_to :creator, class_name: 'User',
                       foreign_key: 'created_by_id',
                       optional: true,
                       inverse_of: :created_tutorings
  belongs_to :tutor, class_name: 'User', optional: true

  enum :state, { pending: 0, active: 1, finished: 2, canceled: 3 }, default: :pending

  has_one :chat, dependent: :destroy

  # Tutorías en las que un usuario está inscripto
  scope :enrolled_by, ->(user) {
    return none if user.blank?

    joins(:user_tutorings).where(user_tutorings: { user_id: user.id })
  }

  # Tutorías en las que un usuario está inscripto como estudiante o tutor
  scope :enrolled_or_tutor_by, ->(user) {
    return none if user.blank?

    enrolled_ids = UserTutoring.select(:tutoring_id).where(user_id: user.id)
    where(tutor_id: user.id).or(where(id: enrolled_ids)).distinct
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

  # Tutorías con tutor asignado
  scope :with_tutor, -> {
    where.not(tutor_id: nil)
  }

  # Tutorías con cupos disponibles
  scope :with_tutor_not_full, -> {
    where("enrolled < capacity and tutor_id IS NOT NULL")
  }

  # Ya pasó y tiene estado finalizada
  # Esto despues habria que cambiarlo para que sea finished y no past, pero lo dejamos asi para la demo.
  scope :past, -> { where(state: :finished).where(scheduled_at: ...Time.current) }

  # Futuras (scheduled_at >= ahora)
  scope :upcoming, -> { where(scheduled_at: Time.current..) }

  scope :search_by_course_name, ->(q) {
    return all if q.blank?

    joins(:course).where("unaccent(courses.name) ILIKE unaccent(?)", "%#{q}%")
  }

  scope :search_by_subject_name, ->(q) {
    return all if q.blank?

    left_joins(:subjects).where("unaccent(subjects.name) ILIKE unaccent(?)", "%#{q}%").distinct
  }

  scope :search_by_modality, ->(q) {
    return all if q.blank?

    where("tutorings.modality ILIKE ?", "%#{q}%")
  }

  # Devuelve tutorías donde un usuario A y un usuario B compartieron tutoría
  scope :shared_between, ->(user_a_id, user_b_id) {
    joins(:user_tutorings)
      .where(state: Tutoring.states[:finished])
      .where(
        "(tutorings.tutor_id = :a AND user_tutorings.user_id = :b)
          OR (tutorings.tutor_id = :b AND user_tutorings.user_id = :a)
          OR (
            tutorings.id IN (
              SELECT ut1.tutoring_id
              FROM user_tutorings ut1
              JOIN user_tutorings ut2 ON ut1.tutoring_id = ut2.tutoring_id
              WHERE ut1.user_id = :a AND ut2.user_id = :b
            )
          )",
        a: user_a_id, b: user_b_id
      )
      .distinct
  }

  scope :active, -> {
    where(state: Tutoring.states[:active])
  }

  # --- Validaciones ---
  validate :scheduled_at_cannot_be_in_past

  validates :duration_mins,
            numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 240 }

  validates :modality,
            presence: true,
            inclusion: { in: %w[virtual presencial],
                         message: :inclusion }

  validate :capacity_not_less_than_enrolled

  validates :request_comment, length: { maximum: 500 }, allow_blank: true
  validates :location, length: { maximum: 255 }, allow_blank: true
  validate :request_due_at_after_now
  validate :request_due_at_before_scheduled_at

  # --- Métodos auxiliares ---

  def enrolled
    user_tutorings.where.not(user_id: tutor_id).count
  end

  private

  def scheduled_at_cannot_be_in_past
    return if scheduled_at.blank?

    if scheduled_at < Time.current
      errors.add(:scheduled_at, :past)
    end
  end

  def capacity_not_less_than_enrolled
    unless capacity.nil?
      if enrolled > capacity
        errors.add(:capacity, :less_than_enrolled)
      end
    end
  end

  def request_due_at_before_scheduled_at
    return if request_due_at.blank? || scheduled_at.blank?

    if request_due_at > scheduled_at
      errors.add(:request_due_at, "must be before scheduled_at")
    end
  end

  def request_due_at_after_now
    return if request_due_at.blank?

    if request_due_at <= Time.current
      errors.add(:request_due_at, "debe ser posterior a la fecha y hora actual")
    end
  end
end
