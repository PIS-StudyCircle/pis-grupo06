class TutoringReminderJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    tutoring = Tutoring.find(tutoring_id)

    # Verificar que la tutoría no esté cancelada
    if tutoring.respond_to?(:cancelled_at) && tutoring.cancelled_at.present?

      return
    end

    # Verificar que la tutoría esté programada para mañana (aproximadamente 24h)
    if tutoring.scheduled_at.blank?

      return
    end

    time_until_tutoring = tutoring.scheduled_at - Time.current

    # Enviar recordatorio si está entre 20-28 horas antes (ventana de 8 horas)
    unless time_until_tutoring.between?(20.hours, 28.hours)

      return
    end

    # Obtener todos los participantes (tutor y estudiantes)
    participants = []

    # Agregar el tutor
    if tutoring.tutor.present?
      participants << tutoring.tutor
    end

    # Agregar el creador si es diferente al tutor
    if tutoring.creator.present? && tutoring.creator != tutoring.tutor
      participants << tutoring.creator
    end

    # Agregar todos los estudiantes inscritos
    students = tutoring.users.to_a
    participants += students

    # Eliminar duplicados
    participants.uniq!

    # Enviar notificación a todos los participantes
    participants.each_with_index do |user, _index|
      TutoringReminderNotifier.with(
        title: "Recordatorio de tutoría",
        url: "/tutorings/#{tutoring.id}",
        course_name: tutoring.course&.name || "Tutoría",
        scheduled_at: tutoring.scheduled_at.iso8601,
        tutoring_id: tutoring.id
      ).deliver_later(user)
    end
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn "Record not found: #{e.message}"
  rescue StandardError => e
    Rails.logger.error "Unexpected error: #{e.message}"
    raise e
  end
end
