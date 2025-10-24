class TutoringCancelledJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id, cancelled_by_user_id, cancellation_reason = nil)
    tutoring = Tutoring.find(tutoring_id)
    cancelled_by_user = User.find(cancelled_by_user_id)
    
    # Obtener todos los participantes (tutor, creador y estudiantes)
    participants = []
    
    # Agregar el tutor si existe
    participants << tutoring.tutor if tutoring.tutor.present?
    
    # Agregar el creador si existe y es diferente al tutor
    participants << tutoring.creator if tutoring.creator.present? && tutoring.creator != tutoring.tutor
    
    # Agregar todos los estudiantes inscritos
    participants += tutoring.users.to_a
    
    # Eliminar duplicados y al usuario que canceló (no necesita notificarse a sí mismo)
    participants.uniq!
    participants.reject! { |user| user.id == cancelled_by_user_id }
    
    # Determinar el tipo de cancelación
    cancelled_by_tutor = tutoring.tutor_id == cancelled_by_user_id
    cancelled_by_creator = tutoring.created_by_id == cancelled_by_user_id
    
    # Enviar notificación a todos los participantes
    participants.each do |user|
      TutoringCancelledNotifier.with(
        title: "Tutoría cancelada",
        url: "/tutorings", # Lleva a la lista de tutorías
        course_name: tutoring.course&.name || "Tutoría",
        tutoring_id: tutoring.id,
        cancelled_by_tutor: cancelled_by_tutor,
        cancelled_by_creator: cancelled_by_creator,
        cancellation_reason: cancellation_reason
      ).deliver_later(user)
    end
    
    Rails.logger.info "Sent cancellation notifications for tutoring #{tutoring_id} to #{participants.count} participants"
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn "TutoringCancelledJob: Record not found - #{e.message}"
  end
end
