class AddEnrolledToTutorings < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:tutorings, :enrolled)
      add_column :tutorings, :enrolled, :integer, default: 0, null: false
    end
  end
end
