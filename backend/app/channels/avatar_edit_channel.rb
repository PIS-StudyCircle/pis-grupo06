class AvatarEditChannel < ApplicationCable::Channel
  def subscribed
    stream_from "avatar_edit_#{current_user.id}"
    Rails.logger.info "Usuario #{current_user.id} suscrito a avatar_edit_#{current_user.id}"
  end

  def unsubscribed
    Rails.logger.info "Usuario #{current_user.id} desuscrito de avatar_edit"
  end
end

