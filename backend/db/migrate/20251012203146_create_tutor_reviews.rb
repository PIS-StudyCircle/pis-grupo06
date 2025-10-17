class CreateTutorReviews < ActiveRecord::Migration[8.0]
  def change
    create_table :tutor_reviews do |t|
      t.integer :tutor_id
      t.integer :student_id
      t.text :review

      t.timestamps
    end
  end
end
