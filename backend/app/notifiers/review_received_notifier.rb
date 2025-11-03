class ReviewReceivedNotifier < ApplicationNotifier
  notification_methods do
    def message
      reviewer_name = params[:reviewer_name] || "Alguien"
      "¡#{reviewer_name} te dejó una reseña!"
    end
  end
end
