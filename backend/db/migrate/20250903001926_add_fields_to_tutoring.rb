class AddFieldsToTutoring < ActiveRecord::Migration[8.0]
  def change
    add_column :tutorings, :modality, :string, null: false
    add_column :tutorings, :capacity, :integer, null: false
  end
end
