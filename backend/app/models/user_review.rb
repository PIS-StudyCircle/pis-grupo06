class UserReview < ApplicationRecord
  belongs_to :reviewer, class_name: "User"
  belongs_to :reviewed, class_name: "User"

  validates :review, presence: true
  validates :reviewer_id, uniqueness: { scope: :reviewed_id }

  validate :shared_tutoring
  validate :cannot_review_self

  private

  def shared_tutoring
    # Caso 1: estudiante reseña a su tutor
    from_student_to_tutor = Tutoring
      .joins(:user_tutorings)
      .where(user_tutorings: { user_id: reviewer_id })
      .where(tutor_id: reviewed_id)
      .exists?

    # Caso 2: tutor reseña a su estudiante
    from_tutor_to_student = Tutoring
      .joins(:user_tutorings)
      .where(tutor_id: reviewer_id, user_tutorings: { user_id: reviewed_id })
      .exists?

    unless from_student_to_tutor || from_tutor_to_student
      errors.add(:base, "Solo se pueden dejar reseñas entre tutor y estudiante que compartieron tutoría")
    end
  end



  def cannot_review_self
    errors.add(:base) if reviewer_id == reviewed_id
  end
end
