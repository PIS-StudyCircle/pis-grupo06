class AddInstituteToCourses < ActiveRecord::Migration[8.0]
  def change
    add_column :courses, :institute, :string, null: true
  end
end
