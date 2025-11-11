module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      token = request.params[:notif_token]
      user_id = Rails.application.message_verifier(:notif).verify(token)
      self.current_user = User.find(user_id)
      Rails.logger.info "✅ AC connected as user_id=#{current_user.id}"
    rescue => e
      Rails.logger.warn "❌ AC reject: #{e.class} - #{e.message}"
      reject_unauthorized_connection
    end
  end
end
