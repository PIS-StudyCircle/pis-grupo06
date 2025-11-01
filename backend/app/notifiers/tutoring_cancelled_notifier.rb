class TutoringCancelledNotifier < ApplicationNotifier
  notification_methods do
    def message
      if params[:cancelled_by_tutor]
        "La tutoría de #{params[:course_name]} fue cancelada por el tutor"
      elsif params[:cancelled_by_creator]
        "La tutoría de #{params[:course_name]} fue cancelada por el creador"
      else
        "La tutoría de #{params[:course_name]} fue cancelada"
      end
    end
  end
end
