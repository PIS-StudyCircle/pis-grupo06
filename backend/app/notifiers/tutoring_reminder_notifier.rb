class TutoringReminderNotifier < ApplicationNotifier
  notification_methods do
    def message
      scheduled_time = Time.zone.parse(params[:scheduled_at])
      formatted_time = scheduled_time.strftime("%d/%m/%Y a las %H:%M")
      "Recordatorio: Tu tutoría de #{params[:course_name]} es mañana (#{formatted_time})"
    end
  end
end
