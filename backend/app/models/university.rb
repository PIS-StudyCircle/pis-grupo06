class University < ApplicationRecord
  has_many :faculties, dependent: :destroy
end
