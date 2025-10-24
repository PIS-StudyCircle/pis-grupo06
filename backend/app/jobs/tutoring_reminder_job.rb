class TutoringReminderJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    tutoring = Tutoring.find(tutoring_id)
    
    # Verificar que la tutoría no esté cancelada
    return if tutoring.respond_to?(:cancelled_at) && tutoring.cancelled_at.present?
    
    # Verificar que la tutoría esté programada para mañana (aproximadamente 24h)
    return unless tutoring.scheduled_at.present?
    
    time_until_tutoring = tutoring.scheduled_at - Time.current
    # Enviar recordatorio si está entre 20-28 horas antes (ventana de 8 horas)
    return unless time_until_tutoring.between?(20.hours, 28.hours)
    
    # Obtener todos los participantes (tutor y estudiantes)
    participants = []
    
    # Agregar el tutor
    participants << tutoring.tutor if tutoring.tutor.present?
    
    # Agregar el creador si es diferente al tutor
    participants << tutoring.creator if tutoring.creator.present? && tutoring.creator != tutoring.tutor
    
    # Agregar todos los estudiantes inscritos
    participants += tutoring.users.to_a
    
    # Eliminar duplicados
    participants.uniq!
    
    # Enviar notificación a todos los participantes
    participants.each do |user|
      TutoringReminderNotifier.with(
        title: "Recordatorio de tutoría",
        url: "/tutorings/#{tutoring.id}",
        course_name: tutoring.course&.name || "Tutoría",
        scheduled_at: tutoring.scheduled_at.iso8601,
        tutoring_id: tutoring.id
      ).deliver_later(user)
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn "TutoringReminderJob: Tutoring #{tutoring_id} not found"
  end
end
