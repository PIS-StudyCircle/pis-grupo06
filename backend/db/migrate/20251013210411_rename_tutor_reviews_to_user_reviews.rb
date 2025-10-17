class RenameTutorReviewsToUserReviews < ActiveRecord::Migration[8.0]
  def change
    rename_table :tutor_reviews, :user_reviews

    rename_column :user_reviews, :tutor_id, :reviewed_id
    rename_column :user_reviews, :student_id, :reviewer_id
  end
end
