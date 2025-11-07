class ChatChannel < ApplicationCable::Channel
  def subscribed
    @chat = Chat.find_by(id: params[:chat_id])

    if @chat && @chat.users.exists?(id: current_user.id)
      stream_for @chat
    else
      reject
    end
  end

  def send_message(data)
    Rails.logger.debug "aca"
    content = data["content"].to_s.strip
    return if content.blank? || @chat.blank?

    message = @chat.messages.create!(
      user: current_user,
      content: ActionController::Base.helpers.sanitize(content)
    )

    ChatChannel.broadcast_to(@chat, serialize_message(message))
  end

  private

  def serialize_message(message)
    {
      id: message.id,
      user_id: message.user_id,
      user_name: message.user.try(:name),
      user_last_name: message.user.try(:last_name),
      content: message.content,
      created_at: message.created_at.iso8601
    }
  end
end
