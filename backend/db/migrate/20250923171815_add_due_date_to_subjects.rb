class AddDueDateToSubjects < ActiveRecord::Migration[8.0]
  def change
    add_column :subjects, :due_date, :date # null: true por defecto
  end
end
