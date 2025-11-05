class RemoveExpiredAvailabilitiesJob < ApplicationJob
  queue_as :default

  def perform
    TutoringAvailability.available.expired.delete_all
  end
end
