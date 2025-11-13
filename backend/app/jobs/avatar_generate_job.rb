# app/jobs/avatar_generate_job.rb
class AvatarGenerateJob < ApplicationJob
  queue_as :default

  MAX_RETRIES = 40
  RETRY_DELAY = 5 # segundos

  def perform(user_id, prompt, request_uuid)
    user = User.find(user_id)

    Rails.logger.info "Iniciando generación para user #{user_id}, request #{request_uuid}"

    begin
      # Obtener request_id de la API externa antes de hacer polling
      deapi = Deapi.new
      request_id = deapi.create_generation_request(prompt, {})
      Rails.logger.info "Request ID de API externa (Deapi): #{request_id} para request_uuid: #{request_uuid}"
      
      # Ahora hacer el polling para obtener el resultado
      image_url = deapi.fetch_result(request_id)
      Rails.logger.info "Generación completada: #{image_url}"

      ActionCable.server.broadcast(
        "avatar_edit_#{user_id}",
        {
          status: 'completed',
          request_uuid: request_uuid,
          image_url: image_url
        }
      )
    rescue Deapi::EditionError => e
      Rails.logger.error "Error de generación: #{e.message}"

      ActionCable.server.broadcast(
        "avatar_edit_#{user_id}",
        {
          status: 'error',
          request_uuid: request_uuid,
          error: e.message
        }
      )
    rescue StandardError => e
      Rails.logger.error "Error inesperado: #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")

      ActionCable.server.broadcast(
        "avatar_edit_#{user_id}",
        {
          status: 'error',
          request_uuid: request_uuid,
          error: "Error generando imagen"
        }
      )
    end
  end
end

