class AddCourseToTutorings < ActiveRecord::Migration[8.0]
  def change
    add_reference :tutorings, :course, null: false, foreign_key: true
  end
end
