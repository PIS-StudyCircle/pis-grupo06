class TutoringFeedbackNotifier < ApplicationNotifier
  notification_methods do
    def message
      "La tutoría de #{params[:course_name]} ha finalizado. ¡Deja tu feedback!"
    end
  end
end
