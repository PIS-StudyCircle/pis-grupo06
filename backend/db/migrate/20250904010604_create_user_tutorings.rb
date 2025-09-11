class CreateUserTutorings < ActiveRecord::Migration[8.0]
  def change
    create_table :user_tutorings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :tutoring, null: false, foreign_key: true
      t.integer :score
      t.text :comment

      t.timestamps
    end

    add_index :user_tutorings, [:user_id, :tutoring_id], unique: true
  end
end
