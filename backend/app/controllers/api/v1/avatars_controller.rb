require "net/http"
require "json"
require "uri"

module Api
  module V1
    class AvatarsController < ApplicationController
      before_action :authenticate_user!

      def create
        prompt = params[:prompt]
        return render json: { error: "Prompt vacío" }, status: :unprocessable_entity if prompt.blank?

        image_url = generate_avatar_with_deapi(prompt)

        if image_url
          #current_user.update(avatar_url: image_url)
          render json: { image_url: image_url }, status: :ok
        else
          render json: { error: "Error generando imagen" }, status: :internal_server_error
        end
      end

      private

      # Paso 1 → Crear la solicitud de generación de imagen
      def generate_avatar_with_deapi(prompt)
        uri = URI("https://api.deapi.ai/api/v1/client/txt2img")

        body = {
          prompt: prompt,
          negative_prompt: "blur, distortion, darkness, noise",
          model: "Flux1schnell",
          width: 512,
          height: 512,
          guidance: 7.5,
          steps: 10,
          seed: rand(1000..9999)
        }

        request = Net::HTTP::Post.new(uri)
        request["Authorization"] = "Bearer #{ENV['DEAPI_KEY']}"
        request["Accept"] = "application/json"
        request["Content-Type"] = "application/json"
        request.body = body.to_json

        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }
        parsed = JSON.parse(response.body) rescue nil

        request_id = parsed&.dig("data", "request_id")
        return nil unless request_id

        # Paso 2 → Esperar el resultado
        fetch_result(request_id)
      end

      # Paso 2 → Consultar estado hasta obtener la imagen final
      def fetch_result(request_id)
        uri = URI("https://api.deapi.ai/api/v1/client/request-status/#{request_id}")

        10.times do
          req = Net::HTTP::Get.new(uri)
          req["Authorization"] = "Bearer #{ENV['DEAPI_KEY']}"
          req["Accept"] = "application/json"

          res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
          parsed = JSON.parse(res.body) rescue {}

          status = parsed.dig("data", "status")
          return parsed.dig("data", "result_url") if status == "done"

          sleep 5 # Esperar antes de reintentar
        end

        nil
      end
    end
  end
end
