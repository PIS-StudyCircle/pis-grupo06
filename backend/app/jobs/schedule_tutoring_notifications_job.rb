class ScheduleTutoringNotificationsJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    Rails.logger.debug { "🔔 [DEBUG] ScheduleTutoringNotificationsJob iniciado para tutoring_id: #{tutoring_id}" }
    Rails.logger.info "🔔 [DEBUG] ScheduleTutoringNotificationsJob iniciado para tutoring_id: #{tutoring_id}"

    tutoring = Tutoring.find(tutoring_id)
    Rails.logger.debug { "🔔 [DEBUG] Tutoring encontrado: ID=#{tutoring.id}, scheduled_at=#{tutoring.scheduled_at}" }
    Rails.logger.info "🔔 [DEBUG] Tutoring encontrado: ID=#{tutoring.id}, scheduled_at=#{tutoring.scheduled_at}"

    return if tutoring.scheduled_at.blank?

    # Programar recordatorio 24 horas antes
    reminder_time = tutoring.scheduled_at - 24.hours
    current_time = Time.current

    Rails.logger.debug "🔔 [DEBUG] Cálculo de tiempos:"
    Rails.logger.debug { "  - scheduled_at: #{tutoring.scheduled_at}" }
    Rails.logger.debug { "  - reminder_time (24h antes): #{reminder_time}" }
    Rails.logger.debug { "  - current_time: #{current_time}" }
    Rails.logger.debug { "  - reminder_time > current_time: #{reminder_time > current_time}" }

    Rails.logger.info "🔔 [DEBUG] Cálculo de tiempos - scheduled_at: #{tutoring.scheduled_at}, reminder_time: #{reminder_time}, current_time: #{current_time}"

    if reminder_time > current_time
      Rails.logger.debug { "🔔 [DEBUG] ✅ Programando TutoringReminderJob para #{reminder_time}" }
      Rails.logger.info "🔔 [DEBUG] ✅ Programando TutoringReminderJob para #{reminder_time}"

      TutoringReminderJob.set(wait_until: reminder_time).perform_later(tutoring_id)
      Rails.logger.debug "🔔 [DEBUG] ✅ TutoringReminderJob programado exitosamente"
      Rails.logger.info "🔔 [DEBUG] ✅ TutoringReminderJob programado exitosamente"
    else
      Rails.logger.debug "🔔 [DEBUG] ❌ NO se programa recordatorio - el tiempo ya pasó"
      Rails.logger.info "🔔 [DEBUG] ❌ NO se programa recordatorio - el tiempo ya pasó"
    end

    # Programar notificación de feedback después de que termine la tutoría
    # Asumimos que una tutoría dura 2 horas por defecto
    feedback_time = tutoring.scheduled_at + 2.hours
    Rails.logger.debug { "🔔 [DEBUG] Programando TutoringFeedbackJob para #{feedback_time}" }
    Rails.logger.info "🔔 [DEBUG] Programando TutoringFeedbackJob para #{feedback_time}"

    TutoringFeedbackJob.set(wait_until: feedback_time).perform_later(tutoring_id)
    Rails.logger.debug "🔔 [DEBUG] ✅ TutoringFeedbackJob programado exitosamente"
    Rails.logger.info "🔔 [DEBUG] ✅ TutoringFeedbackJob programado exitosamente"
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.debug { "🔔 [DEBUG] ❌ ERROR: Tutoring #{tutoring_id} not found - #{e.message}" }
    Rails.logger.warn "🔔 [DEBUG] ❌ ERROR: Tutoring #{tutoring_id} not found - #{e.message}"
  rescue => e
    Rails.logger.debug { "🔔 [DEBUG] ❌ ERROR inesperado: #{e.class} - #{e.message}" }
    Rails.logger.error "🔔 [DEBUG] ❌ ERROR inesperado: #{e.class} - #{e.message}"
    raise e
  end
end
