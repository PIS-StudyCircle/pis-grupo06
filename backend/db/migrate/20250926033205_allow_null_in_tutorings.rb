class AllowNullInTutorings < ActiveRecord::Migration[8.0]
  def change
    change_column_null :tutorings, :scheduled_at, true
    change_column_null :tutorings, :capacity, true
    change_column_null :tutorings, :duration_mins, true
  end
end
