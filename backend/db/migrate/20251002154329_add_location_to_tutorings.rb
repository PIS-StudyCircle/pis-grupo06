class AddLocationToTutorings < ActiveRecord::Migration[8.0]
  def change
    add_column :tutorings, :location, :string
  end
end
