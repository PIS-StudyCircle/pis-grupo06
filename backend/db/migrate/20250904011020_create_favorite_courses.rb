class CreateFavoriteCourses < ActiveRecord::Migration[8.0]
  def change
    create_table :favorite_courses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :course, null: false, foreign_key: true

      t.timestamps
    end

    add_index :favorite_courses, [:user_id, :course_id], unique: true
  end
end
