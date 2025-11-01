# app/controllers/api/v1/messages_controller.rb
module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_chat

      def index
        unless @chat.users.exists?(id: current_user.id)
          return render json: { error: "No autorizado" }, status: :forbidden
        end

        messages = @chat.messages.includes(:user).order(:created_at)
        render json: messages.map { |m|
          {
            id: m.id,
            user_id: m.user_id,
            user_name: m.user.try(:name) || m.user.try(:email),
            content: m.content,
            created_at: m.created_at.iso8601
          }
        }
      end

      private

      def set_chat
        @chat = Chat.find(params[:chat_id])
      end
    end
  end
end
