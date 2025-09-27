class RenameGoogleTokenInUsers < ActiveRecord::Migration[8.0]
  def change
    rename_column :users, :google_token, :google_access_token
  end
end
