class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "notifications:users:#{current_user.id}:notifications"
    Rails.logger.info "NotificationsChannel subscribed to notifications:users:#{current_user.id}:notifications"
  end
end
