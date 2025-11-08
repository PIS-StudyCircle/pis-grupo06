class AddLastNotifiedMessageIdToChatUsers < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:chat_users, :last_notified_message_id)
      add_column :chat_users, :last_notified_message_id, :bigint
      add_index  :chat_users, :last_notified_message_id
    end

    if column_exists?(:chat_users, :last_notified_at)
      remove_index :chat_users, :last_notified_at if index_exists?(:chat_users, :last_notified_at)
      remove_column :chat_users, :last_notified_at, :datetime
    end
  end
end
