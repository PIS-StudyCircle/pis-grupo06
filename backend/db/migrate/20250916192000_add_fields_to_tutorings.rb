class AddFieldsToTutorings < ActiveRecord::Migration[8.0]
  def change
    # FK a users: created_by
    unless column_exists?(:tutorings, :created_by_id)
      add_reference :tutorings, :created_by, foreign_key: { to_table: :users }
    end

    # FK a users: tutor (nullable)
    unless column_exists?(:tutorings, :tutor_id)
      add_reference :tutorings, :tutor, foreign_key: { to_table: :users }, null: true
    end
    
    # Enrolled (cantidad de usuarios)
    add_column :tutorings, :enrolled, :integer, default: 0, null: false
  end
end

