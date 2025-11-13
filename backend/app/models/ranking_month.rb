class RankingMonth < ApplicationRecord
  belongs_to :tutor, class_name: "User"

  scope :for_month, ->(period) { where(period: period.to_date.beginning_of_month) }
end
