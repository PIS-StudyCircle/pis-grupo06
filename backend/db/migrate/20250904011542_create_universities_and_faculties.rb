class CreateUniversitiesAndFaculties < ActiveRecord::Migration[8.0]
  def change
    create_table :universities do |t|
      t.string :name, null: false
      t.timestamps
    end

    create_table :faculties do |t|
      t.string :name, null: false
      t.references :university, null: false, foreign_key: true
      t.timestamps
    end

    add_reference :courses, :faculty, foreign_key: true
    add_reference :users, :faculty, foreign_key: true
  end
end
