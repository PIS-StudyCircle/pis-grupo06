class CreateTutorings < ActiveRecord::Migration[8.0]
  def change
    create_table :tutorings do |t|
      t.datetime :scheduled_at, null: false

      t.timestamps
    end
  end
end
