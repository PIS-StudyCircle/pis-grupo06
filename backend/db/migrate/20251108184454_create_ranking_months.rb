class CreateRankingMonths < ActiveRecord::Migration[8.0]
  def change
    create_table :ranking_months do |t|
      t.date     :period,         null: false
      t.references :tutor,         null: false, foreign_key: { to_table: :users } # agrega index por defecto
      t.decimal  :average_rating,  precision: 4, scale: 2, null: false, default: 0
      t.integer  :total_feedbacks, null: false, default: 0
      t.integer  :rank,            null: false, default: 0
      t.timestamps
    end

    add_index :ranking_months, [:period, :tutor_id], unique: true
    add_index :ranking_months, [:period, :rank]
  end
end
