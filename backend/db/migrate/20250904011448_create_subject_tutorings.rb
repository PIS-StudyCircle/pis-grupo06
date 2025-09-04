class CreateSubjectTutorings < ActiveRecord::Migration[8.0]
  def change
    create_table :subject_tutorings do |t|
      t.references :subject, null: false, foreign_key: true
      t.references :tutoring, null: false, foreign_key: true

      t.timestamps
    end

    add_index :subject_tutorings, [:subject_id, :tutoring_id], unique: true
  end
end
