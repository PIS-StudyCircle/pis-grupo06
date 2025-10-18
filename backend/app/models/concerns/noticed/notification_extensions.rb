module Noticed::NotificationExtensions
  extend ActiveSupport::Concern

  included do
    scope :unread,       -> { where(read_at: nil) }
    scope :unseen,       -> { where(seen_at: nil) }
  end
end
