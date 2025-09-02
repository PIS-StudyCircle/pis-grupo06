class AddDurationToTutoring < ActiveRecord::Migration[8.0]
  def change
    add_column :tutorings, :duration_mins, :integer, default: 60, null: false
  end
end
