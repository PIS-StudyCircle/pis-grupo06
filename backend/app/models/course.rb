class Course < ApplicationRecord
  has_many :subjects
  has_many :favorite_courses
  has_many :fans, through: :favorite_courses, source: :user

  belongs_to :faculty, optional: true
  validates :code, uniqueness: true, allow_nil: true
end
