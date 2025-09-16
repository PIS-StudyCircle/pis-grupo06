class AddUniqueIndexOnSubjectsCourseIdAndName < ActiveRecord::Migration[8.0]
  def change
    add_index :subjects, [:course_id, :name], unique: true
  end
end
