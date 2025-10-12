class UserTutoringValidation < ActiveRecord::Migration[7.1]
  def up

    unless index_exists?(:user_tutorings, [:user_id, :tutoring_id], unique: true)
      add_index :user_tutorings, [:user_id, :tutoring_id], unique: true, name: "idx_user_tutorings_unique_membership"
    end

    add_foreign_key :user_tutorings, :users,     column: :user_id    unless foreign_key_exists?(:user_tutorings, :users)
    add_foreign_key :user_tutorings, :tutorings, column: :tutoring_id unless foreign_key_exists?(:user_tutorings, :tutorings)

    #    (por si la columna enrolled quedó desactualizada)
    execute <<~SQL.squish
      UPDATE tutorings t
      SET enrolled = COALESCE((
        SELECT COUNT(*) FROM user_tutorings ut WHERE ut.tutoring_id = t.id
      ), 0);
    SQL
  end

  def down
    # Revertir índice único
    if index_exists?(:user_tutorings, [:user_id, :tutoring_id], unique: true, name: "idx_user_tutorings_unique_membership")
      remove_index :user_tutorings, name: "idx_user_tutorings_unique_membership"
    end

    # Si querés revertir todo, podrías agregar:
    # remove_foreign_key :user_tutorings, column: :user_id
    # remove_foreign_key :user_tutorings, column: :tutoring_id
  end
end
