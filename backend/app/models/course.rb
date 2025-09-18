class Course < ApplicationRecord
  has_many :subjects, dependent: :destroy
  has_many :favorite_courses, dependent: :destroy
  has_many :fans, through: :favorite_courses, source: :user

  belongs_to :faculty, optional: true
end
