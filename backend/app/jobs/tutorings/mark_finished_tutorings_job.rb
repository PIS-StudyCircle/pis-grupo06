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
      t.update!(state: Tutoring.states[:finished])
    end

    Rails.logger.info "Marked #{tutorings.count} tutorings as finished"
  rescue => e
    Rails.logger.error "[MarkFinishedTutoringsJob] Error updating tutorings: #{e.class} - #{e.message}"
  end
end
