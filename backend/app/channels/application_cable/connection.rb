module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      token = request.params[:notif_token]
      user_id = Rails.application.message_verifier(:notif).verify(token)
      self.current_user = User.find(user_id)
    rescue
      reject_unauthorized_connection
    end
  end
end
