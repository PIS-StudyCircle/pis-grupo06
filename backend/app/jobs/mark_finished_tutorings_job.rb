class MarkFinishedTutoringsJob < ApplicationJob
  queue_as :default

  def perform
    # Find all active tutorings that should be marked as finished
    # A tutoring is finished when: scheduled_at + duration_mins < Time.current
    finished_tutorings = Tutoring.active.where(
      "scheduled_at + INTERVAL '1 minute' * duration_mins < ?", 
      Time.current
    )

    # Update all finished tutorings in a single query for efficiency
    finished_tutorings.update_all(state: Tutoring.states[:finished])
    
    Rails.logger.info "Marked #{finished_tutorings.count} tutorings as finished"
  end
end
