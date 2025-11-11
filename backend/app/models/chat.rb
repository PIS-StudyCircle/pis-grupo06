class Chat < ApplicationRecord
  belongs_to :tutoring
  has_many :messages, dependent: :destroy
  has_many :chat_users, dependent: :destroy
  has_many :users, through: :chat_users
end
