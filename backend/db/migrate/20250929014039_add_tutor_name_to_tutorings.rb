class AddTutorNameToTutorings < ActiveRecord::Migration[8.0]
  def change
    add_column :tutorings, :tutor_name, :string
  end
end
