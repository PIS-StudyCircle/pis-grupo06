class ScheduleTutoringNotificationsJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    tutoring = Tutoring.find(tutoring_id)

    return if tutoring.scheduled_at.blank?

    # Programar recordatorio 24 horas antes
    reminder_time = tutoring.scheduled_at - 24.hours
    current_time = Time.current

    if reminder_time > current_time
      TutoringReminderJob.set(wait_until: reminder_time).perform_later(tutoring_id)
    end

    # Programar notificación de feedback después de que termine la tutoría
    # Asumimos que una tutoría dura 2 horas por defecto
    feedback_time = tutoring.scheduled_at + 2.hours

    TutoringFeedbackJob.set(wait_until: feedback_time).perform_later(tutoring_id)
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn "Record not found: #{e.message}"
  rescue StandardError => e
    Rails.logger.error "Unexpected error: #{e.message}"
    raise e
  end
end
