class AddFieldsToTutorings < ActiveRecord::Migration[8.0]
  def change
    # FK a users: created_by
    add_reference :tutorings, :created_by, foreign_key: { to_table: :users }

    # FK a users: tutor (nullable)
    add_reference :tutorings, :tutor, foreign_key: { to_table: :users }, null: true

    # Enrolled (cantidad de usuarios)
    add_column :tutorings, :enrolled, :integer, default: 0, null: false
  end
end
