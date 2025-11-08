class ChatNotifierJob < ApplicationJob
  queue_as :default

  def perform(message_id)
    message = Message.includes(chat: :chat_users, user: {}).find_by(id: message_id)
    return unless message && message.chat

    chat = message.chat

    chat.chat_users.includes(:user).find_each do |chat_user|
      # no notificar al emisor
      next if chat_user.user_id == message.user_id
      participant = chat_user.user
      next unless participant.present?

      # si ya leyó este mensaje o después, no notificar
      if chat_user.last_read_at.present? && chat_user.last_read_at >= message.created_at
        next
      end

      # si ya tiene una notificación pendiente (no marcó como leída), no notificar de nuevo
      next if chat_user.last_notified_message_id.present?

      ChatNotifier.with(
        title: "Tienes nuevos mensajes sin leer de esta tutoría",
        url: chat.tutoring_id.present? ? "/tutorias/#{chat.tutoring_id}" : "/notificaciones"
      ).deliver_later(participant)

      # marcar que ya se le notificó (sin callbacks)
      chat_user.update_columns(last_notified_message_id: message.id)
    end
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn "ChatNotifierJob: Record not found - #{e.message}"
  end
end
