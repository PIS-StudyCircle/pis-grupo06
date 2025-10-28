class Feedback < ApplicationRecord
  belongs_to :tutor,   class_name: "User"
  belongs_to :student, class_name: "User"
  belongs_to :tutoring, class_name: "Tutoring"

  validates :rating, presence: true

  validates :rating,
            numericality: { greater_than_or_equal_to: 0.5, less_than_or_equal_to: 5.0 }
  validate  :rating_in_half_star_steps

  validates :student_id,
            uniqueness: {scope: [:tutor_id, :tutoring_id]}

  validate :student_cannot_be_tutor

  private

  def rating_in_half_star_steps
    return if rating.blank?

    v = rating.to_d
    errors.add(:rating, "debe ser en pasos de 0.5") unless ((v * 2) % 1).zero?
  end

  def student_cannot_be_tutor
    errors.add(:tutor_id, "no puedes calificarte a ti mismo") if tutor_id == student_id
  end
end
