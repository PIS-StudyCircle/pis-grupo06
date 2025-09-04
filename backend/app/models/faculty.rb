class Faculty < ApplicationRecord
  belongs_to :university
  has_many :courses
  has_many :users
end
