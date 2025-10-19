class AddEventIdToTutorings < ActiveRecord::Migration[8.0]
  def change
    add_column :tutorings, :event_id, :string
  end
end
