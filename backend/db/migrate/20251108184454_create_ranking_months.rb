class CreateRankingMonths < ActiveRecord::Migration[8.0]
  def change
    create_table :ranking_months do |t|
      t.date     :periodo,         null: false # ej. 2025-11-01
      t.references :tutor,         null: false, foreign_key: { to_table: :users } # agrega index por defecto
      t.decimal  :average_rating,  precision: 4, scale: 2, null: false, default: 0
      t.integer  :total_feedbacks, null: false, default: 0
      t.integer  :rank,            null: false, default: 0
      t.timestamps
    end

    add_index :ranking_months, [:periodo, :tutor_id], unique: true
    add_index :ranking_months, [:periodo, :rank]
  end
end
