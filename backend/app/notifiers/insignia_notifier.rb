# app/notifiers/insignia_notifier.rb
class InsigniaNotifier < ApplicationNotifier
  # params esperados: :tipo (símbolo o string)
  param :tipo

  notification_methods do
    # Opcional: usar como título en canales que lo soporten
    def title
      message
    end

    # Texto principal de la notificación
    def message
      tipo       = params[:tipo]&.to_sym
      tipo_label = params[:tipo].to_s.tr("_-", " ")
      user       = recipient

      count = case tipo
              when :tutorias_dadas
                user.respond_to?(:tutorias_dadas_count) ? user.tutorias_dadas_count : user.created_tutorings.count
              when :tutorias_recibidas
                user.respond_to?(:tutorias_recibidas_count) ? user.tutorias_recibidas_count : user.tutorings.count
              when :resenas_dadas
                user.respond_to?(:resenas_dadas_count) ? user.resenas_dadas_count : user.given_reviews.count
              when :feedback_dado
                user.respond_to?(:feedback_dado_count) ? user.feedback_dado_count : user.given_feedbacks.count
              else
                Rails.logger.warn "Tipo de insignia desconocido: #{tipo.inspect}"
                return nil
              end

      case count
      when 1 then "Recibiste una insignia de nivel 1 (#{tipo_label})"
      when 3 then "Recibiste una insignia de nivel 2 (#{tipo_label})"
      when 6 then "Recibiste una insignia de nivel 3 (#{tipo_label})"
      else
        "Progreso de insignia (#{tipo_label})"
      end
    end

    # URL de destino (si el canal soporta deep-link)
    def url
      "/perfil"
    end

    # Evita entregar si no hay mensaje (p. ej. aún no alcanzó un umbral)
    def deliver?
      message.present?
    end
  end
end
