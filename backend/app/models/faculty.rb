class Faculty < ApplicationRecord
  belongs_to :university
  has_many :courses, dependent: :destroy
  has_many :users, dependent: :destroy

  # validaciones
end
