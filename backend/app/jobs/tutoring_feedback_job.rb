class TutoringFeedbackJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    tutoring = Tutoring.find(tutoring_id)
    
    # Verificar que la tutoría no esté cancelada
    return if tutoring.respond_to?(:cancelled_at) && tutoring.cancelled_at.present?
    
    # Verificar que la tutoría haya finalizado
    return unless tutoring.scheduled_at.present? && tutoring.scheduled_at < Time.current
    
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
      TutoringFeedbackNotifier.with(
        title: "Tutoría finalizada - Deja tu feedback",
        url: "/tutorings/#{tutoring.id}/feedback",
        course_name: tutoring.course&.name || "Tutoría",
        tutoring_id: tutoring.id
      ).deliver_later(user)
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn "TutoringFeedbackJob: Tutoring #{tutoring_id} not found"
  end
end
