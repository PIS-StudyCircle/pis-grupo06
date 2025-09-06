class AddCodeToCourses < ActiveRecord::Migration[8.0]
  def change
    add_column :courses, :code, :string, null: true
    # Creates a unique index on the 'code' column, allowing non-distinct null values
    add_index :courses, :code, unique: true, nulls_not_distinct: true
  end
end
