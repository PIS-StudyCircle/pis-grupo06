class Subjects::RemoveRenewExpiredJob < ApplicationJob
  queue_as :default

  RENEW_MONTHS = 3

  def perform
    today = Time.zone.today

    Subject.expired(today).find_in_batches(batch_size: 500) do |batch|
      batch.each { |subject| process_subject(subject, today) }
    end
  end

  private

  def process_subject(subject, today)
    if subject.tutorings.active.exists?
      subject.update!(due_date: today + RENEW_MONTHS.months)
    else
      subject.destroy! # borra también la tabla de join por dependent: :destroy
    end
  rescue => e
    Rails.logger.error "[RemoveRenewExpiredJob] Subject #{subject.id}: #{e.class} - #{e.message}"
  end
end
