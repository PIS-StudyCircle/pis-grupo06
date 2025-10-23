class CreateFeedbacks < ActiveRecord::Migration[8.0]
  def change
    create_table :feedbacks do |t|
      t.integer :tutor_id, null: false
      t.integer :student_id, null: false
      t.text :comment, null: false

      t.timestamps
    end

    # Evita feedbacks duplicados del mismo alumno hacia el mismo tutor
    add_index :feedbacks, [:tutor_id, :student_id], unique: true

    # Si querés mantener integridad referencial:
    add_foreign_key :feedbacks, :users, column: :tutor_id
    add_foreign_key :feedbacks, :users, column: :student_id
  end
end
