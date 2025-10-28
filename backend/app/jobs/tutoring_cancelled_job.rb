class TutoringCancelledJob < ApplicationJob
  queue_as :default

  def perform(tutoring_data, cancelled_by_user_id, cancellation_reason = nil)
    User.find(cancelled_by_user_id)

    # Obtener todos los participantes (tutor, creador y estudiantes)
    participants = []

    # Agregar el tutor si existe
    participants << User.find_by(id: tutoring_data["tutor_id"]) if tutoring_data["tutor_id"].present?

    # Agregar el creador si existe y es diferente al tutor
    if tutoring_data["created_by_id"].present? && tutoring_data["created_by_id"] != tutoring_data["tutor_id"]
      participants << User.find_by(id: tutoring_data["created_by_id"])
    end

    # Agregar todos los estudiantes inscritos
    participants += tutoring_data["users"].map { |u| User.find_by(id: u["id"]) } if tutoring_data["users"].present?

    # Eliminar duplicados y al usuario que canceló (no necesita notificarse a sí mismo)
    participants.compact!
    participants.uniq!
    participants.reject! { |user| user.id == cancelled_by_user_id }

    # Determinar el tipo de cancelación
    cancelled_by_tutor = tutoring_data["tutor_id"] == cancelled_by_user_id
    cancelled_by_creator = tutoring_data["created_by_id"] == cancelled_by_user_id

    # Enviar notificación a todos los participantes
    participants.each do |user|
      TutoringCancelledNotifier.with(
        title: "Tutoría cancelada",
        url: "/tutorings", # Lleva a la lista de tutorías
        course_name: tutoring_data["course_name"] || "Tutoría",
        tutoring_id: tutoring_data["id"],
        cancelled_by_tutor: cancelled_by_tutor,
        cancelled_by_creator: cancelled_by_creator,
        cancellation_reason: cancellation_reason
      ).deliver_later(user)
    end

    Rails.logger.info "Sent cancellation notifications for tutoring #{tutoring_data['id']} " \
                      "to #{participants.count} participants"
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn "TutoringCancelledJob: Record not found - #{e.message}"
  end
end
