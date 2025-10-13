class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "users:#{current_user.id}:notifications"

    Rails.logger.info "NotificationsChannel subscribed to users:#{current_user.id}:notifications"
  end
end
