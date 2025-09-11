class Subject < ApplicationRecord
  belongs_to :course
  belongs_to :creator, class_name: "User", inverse_of: :created_subjects

  has_many :subject_tutorings, dependent: :destroy
  has_many :tutorings, through: :subject_tutorings

  # validaciones
  validates :name, presence: true, uniqueness: { scope: :course_id }
end
