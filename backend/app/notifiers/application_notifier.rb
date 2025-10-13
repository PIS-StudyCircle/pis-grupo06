class ApplicationNotifier < Noticed::Event
  deliver_by :action_cable,
             channel: "NotificationsChannel",
             stream: -> { "users:#{recipient.id}:notifications" },
             message: -> { payload }

  notification_methods do
    def url   = event.params[:url]

    def title = event.params[:title].presence || (respond_to?(:message) ? message : "Notificación")

    def payload
      {
        id:,
        title:,
        url:,
        created_at:,
        read_at:,
        seen_at:
      }
    end
  end
end
