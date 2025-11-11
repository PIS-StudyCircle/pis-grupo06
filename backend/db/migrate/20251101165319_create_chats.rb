class CreateChats < ActiveRecord::Migration[8.0]
  def change
    create_table :chats do |t|
      t.references :tutoring, null: false, foreign_key: true

      t.timestamps
    end
  end
end
