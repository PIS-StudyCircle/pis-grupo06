require "net/http"
require "json"
require "uri"

module Api
  module V1
    class AvatarsController < ApplicationController
      before_action :authenticate_user!

      def edit
        validate_params!

        # Generar UUID único para trackear esta request
        request_uuid = SecureRandom.uuid

        prompt_text = params[:prompt].to_s.strip

        if prompt_text.match?(/fondo|background|fondo de|fondo color/i)
          final_prompt = "#{prompt_text}. No generes una imagen nueva, solo edita la imagen que te doy"
        else
          final_prompt = prompt_text + ". Mantener el fondo original. " +
                         "No generes una imagen nueva, solo edita la imagen que te doy"
        end

        # Guardar imagen temporalmente
        temp_path = save_temp_image(params[:image])

        # Encolar el job
        EditAvatarJob.perform_later(
          current_user.id,
          temp_path,
          final_prompt,
          request_uuid
        )

        Rails.logger.info "Job encolado para user #{current_user.id}, request #{request_uuid}"

        # Responder inmediatamente con el UUID
        render json: {
          status: 'processing',
          request_uuid: request_uuid,
          message: 'Image is being processed'
        }, status: :accepted

      rescue StandardError => e
        Rails.logger.error "Error al encolar job: #{e.message}"
        Rails.logger.error e.backtrace.first(5).join("\n")
        render json: { error: "Error queueing image edit: #{e.message}" }, status: :internal_server_error
      end

      def create
        prompt = params[:prompt].to_s.strip
        return render json: { error: "Prompt vacío" }, status: :unprocessable_entity if prompt.blank?

        request_uuid = SecureRandom.uuid

        AvatarGenerateJob.perform_later(
          current_user.id,
          prompt,
          request_uuid
        )

        render json: {
          status: 'processing',
          request_uuid: request_uuid,
          message: 'Image is being generated'
        }, status: :accepted

      rescue StandardError => e
        Rails.logger.error "Error al encolar job de generación: #{e.message}"
        render json: { error: "Error queueing image generation: #{e.message}" }, status: :internal_server_error
      end

      private

      def validate_params!
        if params[:image].blank?
          raise ArgumentError, "Image is required"
        end

        if params[:prompt].blank?
          raise ArgumentError, "Prompt is required"
        end
      end

      def save_temp_image(uploaded_file)
        # Crear directorio temporal si no existe
        temp_dir = Rails.root.join('tmp', 'avatar_uploads')
        FileUtils.mkdir_p(temp_dir)

        # Generar nombre único
        extension = File.extname(uploaded_file.original_filename)
        filename = "#{SecureRandom.uuid}#{extension}"
        temp_path = temp_dir.join(filename).to_s

        # Guardar archivo
        if uploaded_file.respond_to?(:tempfile)
          FileUtils.cp(uploaded_file.tempfile.path, temp_path)
        else
          File.open(temp_path, 'wb') { |f| f.write(uploaded_file.read) }
        end

        Rails.logger.info "Imagen guardada temporalmente en: #{temp_path}"
        temp_path
      end
    end
  end
end
