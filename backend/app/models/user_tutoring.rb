class UserTutoring < ApplicationRecord
  belongs_to :user
  belongs_to :tutoring, counter_cache: :enrolled

  validates :user_id, uniqueness: { scope: :tutoring_id }
end
