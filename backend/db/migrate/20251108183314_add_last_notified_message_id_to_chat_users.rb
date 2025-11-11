class AddLastNotifiedMessageIdToChatUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :chat_users, :last_notified_message_id, :bigint
    add_index  :chat_users, :last_notified_message_id

    add_column :chat_users, :last_read_at, :datetime
    add_index  :chat_users, :last_read_at
  end
end
