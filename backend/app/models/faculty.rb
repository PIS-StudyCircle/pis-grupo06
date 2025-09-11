class Faculty < ApplicationRecord
  belongs_to :university
  has_many :courses
  has_many :users

  # validaciones 
  validates :university, presence: true
end
