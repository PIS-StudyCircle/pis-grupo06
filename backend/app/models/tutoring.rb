class Tutoring < ApplicationRecord
  has_many :user_tutorings, dependent: :destroy
  has_many :users, through: :user_tutorings

  has_many :subject_tutorings, dependent: :destroy
  has_many :subjects, through: :subject_tutorings
end
