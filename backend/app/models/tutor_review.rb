class TutorReview < ApplicationRecord
  belongs_to :tutor, class_name: "User"
  belongs_to :student, class_name: "User"

  validates :review, presence: true

  validates :student_id, uniqueness: { scope: :tutor_id }

  validate :student_has_participated_with_tutor
  validate :student_cannot_review_self

  private

  def student_has_participated_with_tutor
    return if Tutoring
               .joins(:user_tutorings)
               .where(tutor_id: tutor_id, user_tutorings: { user_id: student_id })
               .exists?
    errors.add(:base)
  end

  def student_cannot_review_self
    errors.add(:base) if student_id == tutor_id
  end
end
