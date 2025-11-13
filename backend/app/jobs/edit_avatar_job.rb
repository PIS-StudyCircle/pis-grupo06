# app/jobs/edit_avatar_job.rb
class EditAvatarJob < ApplicationJob
  queue_as :default

  MAX_RETRIES = 40
  RETRY_DELAY = 5 # segundos

  def perform(user_id, image_path, prompt, request_uuid)
    user = User.find(user_id)

    Rails.logger.info "Iniciando edición para user #{user_id}, request #{request_uuid}"

    begin
      # Llamamos a Deapi con polling interno
      request_id = Deapi.new.create_edition_request(
        image_path,
        prompt,
        {
          negative_prompt: "imagen completamente diferente, cara distinta, fondo cambiado, baja resolución, deformaciones, realismo fotográfico, texto, marcas de agua",
          model: "QwenImageEdit_Plus_NF4",
          guidance: 7.5,
          steps: 10,
          seed: rand(1000..9999)
        }
      )

      Rails.logger.info "Request ID de API externa (Deapi): #{request_id} para request_uuid: #{request_uuid}"

      unless request_id
        raise StandardError, "No se pudo obtener request_id de la API externa"
      end

      MAX_RETRIES.times do
        response = Deapi.new.fetch_status(request_id)
        status = response.dig("data", "status")

        case status
        when "done"
          image_url = response.dig("data", "result_url")
          Rails.logger.info "Edición completada: #{image_url}"

          ActionCable.server.broadcast(
            "avatar_edit_#{user_id}",
            {
              status: 'completed',
              request_uuid: request_uuid,
              image_url: image_url
            }
          )
          return
        when "failed", "error"
          error_message = response.dig("data", "error") || "Error al editar la imagen"
          Rails.logger.error "Deapi edit failed: #{error_message}"

          ActionCable.server.broadcast(
            "avatar_edit_#{user_id}",
            {
              status: 'error',
              request_uuid: request_uuid,
              error: error_message
            }
          )
          return
        end

        sleep RETRY_DELAY
      end

      # Timeout
      Rails.logger.error "Timeout waiting for image edition (user #{user.id})"
      ActionCable.server.broadcast(
        "avatar_edit_#{user_id}",
        {
          status: 'error',
          request_uuid: request_uuid,
          error: "Timeout esperando resultado de edición"
        }
      )
    rescue => e
      Rails.logger.error "Error in EditAvatarJob: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")

      ActionCable.server.broadcast(
        "avatar_edit_#{user_id}",
        {
          status: 'error',
          request_uuid: request_uuid,
          error: "Error inesperado: #{e.message}"
        }
      )
    ensure
      # Limpiar archivo temporal
      begin
        File.delete(image_path) if image_path && File.exist?(image_path)
      rescue => e
        Rails.logger.warn "No se pudo eliminar archivo temporal #{image_path}: #{e.message}"
      end
    end
  end
end
