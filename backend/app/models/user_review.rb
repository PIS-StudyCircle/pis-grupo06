class UserReview < ApplicationRecord
  belongs_to :reviewer, class_name: "User"
  belongs_to :reviewed, class_name: "User"

  validates :review, presence: true
  validates :reviewer_id, uniqueness: { scope: :reviewed_id }

  validate :shared_tutoring
  validate :cannot_review_self

  private

  def shared_tutoring
    unless Tutoring.shared_between(reviewer_id, reviewed_id).exists?
      errors.add(:base, "Solo se pueden dejar reseñas entre tutor y estudiante que compartieron tutoría")
    end
  end

  def cannot_review_self
    errors.add(:base) if reviewer_id == reviewed_id
  end
end
