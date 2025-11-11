class Message < ApplicationRecord
  belongs_to :chat
  belongs_to :user

  # asegurar que el job se encola solo cuando la transacción committeó
  after_create_commit :enqueue_chat_notifier_job

  private

  def enqueue_chat_notifier_job
    ChatNotifierJob.perform_later(id)
  end
end
