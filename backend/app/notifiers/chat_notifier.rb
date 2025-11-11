class ChatNotifier < ApplicationNotifier
  notification_methods do
    def message
      "Tienes nuevos mensajes sin leer de esta tutoría"
    end
  end
end
