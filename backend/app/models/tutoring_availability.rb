class TutoringAvailability < ApplicationRecord
    belongs_to :tutoring
  
    validates :start_time, :end_time, presence: true
    validate :end_time_after_start_time
  
    scope :available, -> { where(is_booked: false) }
    scope :booked, -> { where(is_booked: true) }
    
    private
  
    def end_time_after_start_time
      return if end_time.blank? || start_time.blank?
  
      if end_time <= start_time
        errors.add(:end_time, "must be after start time")
      end
    end
  end