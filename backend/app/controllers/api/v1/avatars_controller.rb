require "net/http"
require "json"
require "uri"

module Api
  module V1
    class AvatarsController < ApplicationController
      before_action :authenticate_user!

      def edit
        validate_params!
        prompt_text = params[:prompt].to_s.strip

        if prompt_text.match?(/fondo|background|fondo de|fondo color/i)
          final_prompt = "#{prompt_text}. No generes una imagen nueva, solo edita la imagen que te doy"
        else
          final_prompt = prompt_text + ". Mantener el fondo original. " +
                         "No generes una imagen nueva, solo edita la imagen que te doy"
        end
        image_url = Deapi.new.edit(
          image: params[:image],
          prompt: final_prompt,
          negative_prompt: "imagen completamente diferente, cara distinta, fondo cambiado, baja resolución," +
            " deformaciones, realismo fotográfico, texto, marcas de agua",
          model: "QwenImageEdit_Plus_NF4",
          guidance: 7.5,
          steps: 10,
          seed: rand(1000..9999),
        )

        render json: { image_url: image_url }, status: :ok
      rescue Deapi::EditionError => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue StandardError => e
        render json: { error: "Error editing image: #{e.message}" }, status: :internal_server_error
      end

      def create
        prompt = params[:prompt].to_s.strip
        return render json: { error: "Prompt vacío" }, status: :unprocessable_entity if prompt.blank?

        begin
          image_url = Deapi.new.generate(prompt: prompt)

          render json: { image_url: image_url }, status: :ok
        rescue Deapi::EditionError => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue StandardError
          render json: { error: "Error generando imagen" }, status: :internal_server_error
        end
      end

      private

      def validate_params!
        if params[:image].blank?
          raise DeapiImageEditor::EditionError, "Image is required"
        end

        if params[:prompt].blank?
          raise DeapiImageEditor::EditionError, "Prompt is required"
        end
      end
    end
  end
end
