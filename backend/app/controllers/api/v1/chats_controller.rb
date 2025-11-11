module Api
  module V1
    class ChatsController < ApplicationController
      before_action :authenticate_user!

      def mark_read
        chat = Chat.find(params[:id])
        chat_user = chat.chat_users.find_by(user_id: current_user.id)

        if chat_user
          chat_user.update!(last_read_at: Time.current, last_notified_message_id: nil)
          head :no_content
        else
          render json: { error: "No perteneces a este chat" }, status: :forbidden
        end
      end
    end
  end
end
