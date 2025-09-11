class Subject < ApplicationRecord
  belongs_to :course
  belongs_to :creator, class_name: "User"

  has_many :subject_tutorings
  has_many :tutorings, through: :subject_tutorings

  # validaciones
  validates :course, presence: true
  validates :name, presence: true, uniqueness: { scope: :course_id }
end
