# To deliver this notification:
#
# PingNotifier.with(record: @post, message: "New post").deliver(User.all)

class PingNotifier < ApplicationNotifier
  notification_methods do
    def message = "Ping de prueba 🔔"
  end
end
