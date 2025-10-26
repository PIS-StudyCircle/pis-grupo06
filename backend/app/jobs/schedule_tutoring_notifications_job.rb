class ScheduleTutoringNotificationsJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    puts "🔔 [DEBUG] ScheduleTutoringNotificationsJob iniciado para tutoring_id: #{tutoring_id}"
    Rails.logger.info "🔔 [DEBUG] ScheduleTutoringNotificationsJob iniciado para tutoring_id: #{tutoring_id}"
    
    tutoring = Tutoring.find(tutoring_id)
    puts "🔔 [DEBUG] Tutoring encontrado: ID=#{tutoring.id}, scheduled_at=#{tutoring.scheduled_at}"
    Rails.logger.info "🔔 [DEBUG] Tutoring encontrado: ID=#{tutoring.id}, scheduled_at=#{tutoring.scheduled_at}"
    
    return unless tutoring.scheduled_at.present?
    
    # Programar recordatorio 24 horas antes
    reminder_time = tutoring.scheduled_at - 24.hours
    current_time = Time.current
    
    puts "🔔 [DEBUG] Cálculo de tiempos:"
    puts "  - scheduled_at: #{tutoring.scheduled_at}"
    puts "  - reminder_time (24h antes): #{reminder_time}"
    puts "  - current_time: #{current_time}"
    puts "  - reminder_time > current_time: #{reminder_time > current_time}"
    
    Rails.logger.info "🔔 [DEBUG] Cálculo de tiempos - scheduled_at: #{tutoring.scheduled_at}, reminder_time: #{reminder_time}, current_time: #{current_time}"
    
    if reminder_time > current_time
      puts "🔔 [DEBUG] ✅ Programando TutoringReminderJob para #{reminder_time}"
      Rails.logger.info "🔔 [DEBUG] ✅ Programando TutoringReminderJob para #{reminder_time}"
      
      TutoringReminderJob.set(wait_until: reminder_time).perform_later(tutoring_id)
      puts "🔔 [DEBUG] ✅ TutoringReminderJob programado exitosamente"
      Rails.logger.info "🔔 [DEBUG] ✅ TutoringReminderJob programado exitosamente"
    else
      puts "🔔 [DEBUG] ❌ NO se programa recordatorio - el tiempo ya pasó"
      Rails.logger.info "🔔 [DEBUG] ❌ NO se programa recordatorio - el tiempo ya pasó"
    end
    
    # Programar notificación de feedback después de que termine la tutoría
    # Asumimos que una tutoría dura 2 horas por defecto
    feedback_time = tutoring.scheduled_at + 2.hours
    puts "🔔 [DEBUG] Programando TutoringFeedbackJob para #{feedback_time}"
    Rails.logger.info "🔔 [DEBUG] Programando TutoringFeedbackJob para #{feedback_time}"
    
    TutoringFeedbackJob.set(wait_until: feedback_time).perform_later(tutoring_id)
    puts "🔔 [DEBUG] ✅ TutoringFeedbackJob programado exitosamente"
    Rails.logger.info "🔔 [DEBUG] ✅ TutoringFeedbackJob programado exitosamente"
    
  rescue ActiveRecord::RecordNotFound => e
    puts "🔔 [DEBUG] ❌ ERROR: Tutoring #{tutoring_id} not found - #{e.message}"
    Rails.logger.warn "🔔 [DEBUG] ❌ ERROR: Tutoring #{tutoring_id} not found - #{e.message}"
  rescue => e
    puts "🔔 [DEBUG] ❌ ERROR inesperado: #{e.class} - #{e.message}"
    Rails.logger.error "🔔 [DEBUG] ❌ ERROR inesperado: #{e.class} - #{e.message}"
    raise e
  end
end
