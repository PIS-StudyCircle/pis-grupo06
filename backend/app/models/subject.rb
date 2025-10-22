class Subject < ApplicationRecord
  belongs_to :course
  belongs_to :creator, class_name: "User", inverse_of: :created_subjects, optional: true

  has_many :subject_tutorings, dependent: :destroy
  has_many :tutorings, through: :subject_tutorings

  # validaciones
  validates :name, presence: true, uniqueness: { scope: :course_id }

  before_validation :set_default_due_date, on: :create

  def set_default_due_date
    self.due_date ||= 3.months.from_now.to_date
  end

  scope :expired, -> (today = Time.zone.today) {
    where.not(due_date: nil).where("due_date <= ?", today)
  }
end
