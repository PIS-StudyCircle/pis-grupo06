class MakeSubjectCreatorNullable < ActiveRecord::Migration[8.0]
  def up
    change_column_null :subjects, :creator_id, true

    remove_foreign_key :subjects, column: :creator_id
    add_foreign_key :subjects, :users, column: :creator_id, on_delete: :nullify
  end

  def down
    remove_foreign_key :subjects, column: :creator_id
    add_foreign_key :subjects, :users, column: :creator_id
    change_column_null :subjects, :creator_id, false
  end
end
