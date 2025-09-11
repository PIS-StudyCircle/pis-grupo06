class AddCourseToSubjects < ActiveRecord::Migration[8.0]
  def change
    add_reference :subjects, :course, null: false, foreign_key: true
  end
end
