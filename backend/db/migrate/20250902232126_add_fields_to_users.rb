class AddFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :name, :string, null: false
    add_column :users, :last_name, :string, null: false
    add_column :users, :description, :text
  end
end
