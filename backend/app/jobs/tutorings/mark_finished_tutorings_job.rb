class Tutorings::MarkFinishedTutoringsJob < ApplicationJob
  queue_as :default

  def perform
    # Find all active tutorings that should be marked as finished
    # A tutoring is finished when: scheduled_at + duration_mins < Time.current
    finished_tutorings = Tutoring.active.where(
      "scheduled_at + (duration_mins * interval '1 minute') < ?", Time.current
    )

    # Update all finished tutorings
    update_tutorings_state(finished_tutorings)
  end

  private

  def update_tutorings_state(tutorings)
    tutorings.each do |t|
      # Camino normal: intenta actualizar con validaciones
      # Si no se hace este camino no se puede chequear en el test cuando ocurre un error en el proceso
      t.update!(state: :finished)
    rescue ActiveRecord::RecordInvalid => e
      # Si no pasa las validaciones, forzar el cambio sin validar
      Rails.logger.warn "[MarkFinishedTutoringsJob] Tutoring##{t.id} invalid: #{e.message} — forcing state"
      t.state = :finished # Obs "t.update(state: :finished, validate: false)" no funciona correctamente con enums
      t.save(validate: false)
    rescue => e
      # Cualquier otro error (por ejemplo el “Fallo controlado” del spec)
      Rails.logger.error "[MarkFinishedTutoringsJob] Tutoring##{t.id} #{e.class}: #{e.message}"
    end

    Rails.logger.info "Marked #{tutorings.count} tutorings as finished"
  end
end
