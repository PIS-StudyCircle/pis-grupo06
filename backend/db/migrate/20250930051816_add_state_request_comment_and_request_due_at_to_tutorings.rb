class AddStateRequestCommentAndRequestDueAtToTutorings < ActiveRecord::Migration[8.0]
  def change
    add_column :tutorings, :state, :integer, default: 0, null: false
    add_index  :tutorings, :state
    add_column :tutorings, :request_comment, :text
    add_column :tutorings, :request_due_at, :datetime
  end
end
