class Feedback < ApplicationRecord
  belongs_to :tutor, class_name: "User"
  belongs_to :student, class_name: "User"
  belongs_to :tutoring, optional: true

  validates :tutor_id, :student_id, :comment, presence: true
  validates :comment, length: { maximum: 1000 }
  validates :student_id, uniqueness: { scope: :tutor_id, message: "ya dejó feedback para este tutor" }

  validate :student_cannot_be_tutor

  private

  def student_cannot_be_tutor
    errors.add(:tutor_id, "no puedes dejarte feedback a ti mismo") if tutor_id == student_id
  end
end
