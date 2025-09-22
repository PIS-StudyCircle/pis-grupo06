class AddDueDateToSubjects < ActiveRecord::Migration[8.0]
  def change
    add_column :subjects, :due_date, :datetime
  end
end
