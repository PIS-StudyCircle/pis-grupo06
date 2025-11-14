class AddGamificationCountersToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :tutorias_dadas_count, :integer, default: 0, null: false
    add_column :users, :tutorias_recibidas_count, :integer, default: 0, null: false
    add_column :users, :resenas_dadas_count, :integer, default: 0, null: false
    add_column :users, :feedback_dado_count, :integer, default: 0, null: false
  end
end
