class AddUniqueIndexToUserReviews < ActiveRecord::Migration[8.0]
   def change
    add_index :user_reviews, [:reviewer_id, :reviewed_id], unique: true
  end
end
