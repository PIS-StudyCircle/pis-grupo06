class Tutorings::MarkFinishedTutoringsJob < ApplicationJob
  queue_as :default

  def perform
    # Encuentra todas las tutorías activas que deberían marcarse como finalizadas
    # Una tutoría está finalizada cuando: scheduled_at + duration_mins < Time.current
    finished_tutorings = Tutoring.active.where(
      "scheduled_at + (duration_mins * interval '1 minute') < ?", Time.current
    )

    # Encuentra tutorías donde TODAS las tutoring_availabilities asociadas tienen start_time < Time.current
    expired_pending_tutorings = find_expired_pending_tutorings

    # Actualiza todas las tutorías finalizadas
    update_tutorings_state(finished_tutorings)

    # Elimina tutorías vencidas pending/active que cumplan los criterios
    destroy_expired_tutorings(expired_pending_tutorings)
  end

  private

  def update_tutorings_state(tutorings)
    tutorings.each do |t|
      # Camino normal: intenta actualizar con validaciones
      # Si no se hace este camino no se puede chequear en el test cuando ocurre un error en el proceso
      t.update!(state: :finished)

      # Encolar job que notifica a participantes para dejar feedback
      TutoringFeedbackJob.perform_later(t.id)
    rescue ActiveRecord::RecordInvalid => e
      # Si no pasa las validaciones, forzar el cambio sin validar
      Rails.logger.warn "[MarkFinishedTutoringsJob] Tutoring##{t.id} invalid: #{e.message} — forcing state"
      t.state = :finished # Obs "t.update(state: :finished, validate: false)" no funciona correctamente con enums
      t.save(validate: false)
      # Encolar igualmente el job de feedback aun cuando forzamos el cambio
      TutoringFeedbackJob.perform_later(t.id)
    rescue => e
      # Cualquier otro error (por ejemplo el “Fallo controlado” del spec)
      Rails.logger.error "[MarkFinishedTutoringsJob] Tutoring##{t.id} #{e.class}: #{e.message}"
    end

    Rails.logger.info "Marked #{tutorings.count} tutorings as finished"
  end

  def find_expired_pending_tutorings
    # Encuentra tutorías donde TODAS las tutoring_availabilities asociadas tienen start_time < Time.current
    # Esta consulta encuentra tutorías que:
    # 1. Tienen al menos una tutoring_availability (para evitar tutorías sin disponibilidades)
    # 2. NO tienen ninguna tutoring_availability con start_time >= Time.current
    Tutoring.where(
      "EXISTS (
        SELECT 1 FROM tutoring_availabilities
        WHERE tutoring_availabilities.tutoring_id = tutorings.id
      ) AND NOT EXISTS (
        SELECT 1 FROM tutoring_availabilities
        WHERE tutoring_availabilities.tutoring_id = tutorings.id
        AND tutoring_availabilities.start_time >= ?
      )",
      Time.current
    )
  end

  def destroy_expired_tutorings(tutorings)
    destroyed_count = 0

    tutorings.find_each do |tutoring|
      should_destroy = false

      if tutoring.state == 'pending'
        should_destroy = true
      end

      if should_destroy
        tutoring.destroy
        destroyed_count += 1
        Rails.logger.info "[MarkFinishedTutoringsJob] Destroyed tutoring##{tutoring.id} (state: #{tutoring.state})"
      end
    rescue => e
      Rails.logger.error "[MarkFinishedTutoringsJob] Error destroying tutoring##{tutoring.id}: #{e.class}: #{e.message}"
    end

    Rails.logger.info "Destroyed #{destroyed_count} expired tutorings" if destroyed_count > 0
  end
end
