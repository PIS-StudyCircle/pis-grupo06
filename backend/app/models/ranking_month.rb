class RankingMonth < ApplicationRecord
  belongs_to :tutor, class_name: "User"

  scope :del_mes, ->(periodo) { where(periodo: periodo.to_date.beginning_of_month) }
end