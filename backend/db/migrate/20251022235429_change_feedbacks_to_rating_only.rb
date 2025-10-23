class ChangeFeedbacksToRatingOnly < ActiveRecord::Migration[8.0]
  def change
    add_column :feedbacks, :rating, :decimal, precision: 2, scale: 1, null: false, default: 5.0
    remove_column :feedbacks, :comment, :text  
  end
end
