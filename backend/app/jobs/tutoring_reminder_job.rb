class TutoringReminderJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    puts "🔔 [DEBUG] TutoringReminderJob ejecutándose para tutoring_id: #{tutoring_id}"
    Rails.logger.info "🔔 [DEBUG] TutoringReminderJob ejecutándose para tutoring_id: #{tutoring_id}"
    
    tutoring = Tutoring.find(tutoring_id)
    puts "🔔 [DEBUG] Tutoring encontrado: ID=#{tutoring.id}, scheduled_at=#{tutoring.scheduled_at}"
    Rails.logger.info "🔔 [DEBUG] Tutoring encontrado: ID=#{tutoring.id}, scheduled_at=#{tutoring.scheduled_at}"
    
    # Verificar que la tutoría no esté cancelada
    if tutoring.respond_to?(:cancelled_at) && tutoring.cancelled_at.present?
      puts "🔔 [DEBUG] ❌ Tutoría cancelada, no se envía recordatorio"
      Rails.logger.info "🔔 [DEBUG] ❌ Tutoría cancelada, no se envía recordatorio"
      return
    end
    
    # Verificar que la tutoría esté programada para mañana (aproximadamente 24h)
    unless tutoring.scheduled_at.present?
      puts "🔔 [DEBUG] ❌ No hay scheduled_at, no se envía recordatorio"
      Rails.logger.info "🔔 [DEBUG] ❌ No hay scheduled_at, no se envía recordatorio"
      return
    end
    
    time_until_tutoring = tutoring.scheduled_at - Time.current
    puts "🔔 [DEBUG] Tiempo hasta la tutoría: #{time_until_tutoring} (#{time_until_tutoring / 1.hour} horas)"
    Rails.logger.info "🔔 [DEBUG] Tiempo hasta la tutoría: #{time_until_tutoring} (#{time_until_tutoring / 1.hour} horas)"
    
    # Enviar recordatorio si está entre 20-28 horas antes (ventana de 8 horas)
    unless time_until_tutoring.between?(20.hours, 28.hours)
      puts "🔔 [DEBUG] ❌ Fuera de la ventana de recordatorio (20-28h), no se envía"
      Rails.logger.info "🔔 [DEBUG] ❌ Fuera de la ventana de recordatorio (20-28h), no se envía"
      return
    end
    
    puts "🔔 [DEBUG] ✅ Dentro de la ventana de recordatorio, procediendo a enviar notificaciones"
    Rails.logger.info "🔔 [DEBUG] ✅ Dentro de la ventana de recordatorio, procediendo a enviar notificaciones"
    
    # Obtener todos los participantes (tutor y estudiantes)
    participants = []
    
    # Agregar el tutor
    if tutoring.tutor.present?
      participants << tutoring.tutor
      puts "🔔 [DEBUG] Agregado tutor: #{tutoring.tutor.id}"
    end
    
    # Agregar el creador si es diferente al tutor
    if tutoring.creator.present? && tutoring.creator != tutoring.tutor
      participants << tutoring.creator
      puts "🔔 [DEBUG] Agregado creador: #{tutoring.creator.id}"
    end
    
    # Agregar todos los estudiantes inscritos
    students = tutoring.users.to_a
    participants += students
    puts "🔔 [DEBUG] Agregados #{students.count} estudiantes"
    
    # Eliminar duplicados
    participants.uniq!
    puts "🔔 [DEBUG] Total de participantes únicos: #{participants.count}"
    Rails.logger.info "🔔 [DEBUG] Total de participantes únicos: #{participants.count}"
    
    # Enviar notificación a todos los participantes
    participants.each_with_index do |user, index|
      puts "🔔 [DEBUG] Enviando notificación #{index + 1}/#{participants.count} a usuario #{user.id}"
      Rails.logger.info "🔔 [DEBUG] Enviando notificación #{index + 1}/#{participants.count} a usuario #{user.id}"
      
      TutoringReminderNotifier.with(
        title: "Recordatorio de tutoría",
        url: "/tutorings/#{tutoring.id}",
        course_name: tutoring.course&.name || "Tutoría",
        scheduled_at: tutoring.scheduled_at.iso8601,
        tutoring_id: tutoring.id
      ).deliver_later(user)
      
      puts "🔔 [DEBUG] ✅ Notificación programada para usuario #{user.id}"
    end
    
    puts "🔔 [DEBUG] ✅ Todas las notificaciones de recordatorio enviadas exitosamente"
    Rails.logger.info "🔔 [DEBUG] ✅ Todas las notificaciones de recordatorio enviadas exitosamente"
    
  rescue ActiveRecord::RecordNotFound => e
    puts "🔔 [DEBUG] ❌ ERROR: Tutoring #{tutoring_id} not found - #{e.message}"
    Rails.logger.warn "🔔 [DEBUG] ❌ ERROR: Tutoring #{tutoring_id} not found - #{e.message}"
  rescue => e
    puts "🔔 [DEBUG] ❌ ERROR inesperado: #{e.class} - #{e.message}"
    Rails.logger.error "🔔 [DEBUG] ❌ ERROR inesperado: #{e.class} - #{e.message}"
    raise e
  end
end
