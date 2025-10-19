class CreateTutoringAvailabilities < ActiveRecord::Migration[8.0]
  def change
    create_table :tutoring_availabilities do |t|
      t.bigint :tutoring_id, null: false
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.boolean :is_booked, default: false, null: false
      t.timestamps
    end

    add_index :tutoring_availabilities, :tutoring_id
    add_index :tutoring_availabilities, [:tutoring_id, :start_time], name: "index_availabilities_on_tutoring_and_start"
    add_foreign_key :tutoring_availabilities, :tutorings
  end
end
