class FixUniqueIndexOnFeedbacks < ActiveRecord::Migration[8.0]
  def change
    # elimina el índice viejo
    remove_index :feedbacks, [:tutor_id, :student_id], if_exists: true

    # crea el nuevo índice con la combinación correcta
    add_index :feedbacks, [:student_id, :tutor_id, :tutoring_id], unique: true, name: "index_feedbacks_on_user_tutor_tutoring"
  end
end
