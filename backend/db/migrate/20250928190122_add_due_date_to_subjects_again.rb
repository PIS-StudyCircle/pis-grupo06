class AddDueDateToSubjectsAgain < ActiveRecord::Migration[8.0]
  def change
    add_column :subjects, :due_date, :date
  end
end
