class ScheduleTutoringNotificationsJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    tutoring = Tutoring.find(tutoring_id)
    
    return unless tutoring.scheduled_at.present?
    
    # Programar recordatorio 24 horas antes
    reminder_time = tutoring.scheduled_at - 24.hours
    if reminder_time > Time.current
      TutoringReminderJob.set(wait_until: reminder_time).perform_later(tutoring_id)
      Rails.logger.info "Scheduled reminder for tutoring #{tutoring_id} at #{reminder_time}"
    end
    
    # Programar notificación de feedback después de que termine la tutoría
    # Asumimos que una tutoría dura 2 horas por defecto
    feedback_time = tutoring.scheduled_at + 2.hours
    TutoringFeedbackJob.set(wait_until: feedback_time).perform_later(tutoring_id)
    Rails.logger.info "Scheduled feedback notification for tutoring #{tutoring_id} at #{feedback_time}"
    
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn "ScheduleTutoringNotificationsJob: Tutoring #{tutoring_id} not found"
  end
end
