require "net/http"
require "json"
require "uri"

module Api
  module V1
    class AvatarsController < ApplicationController
      before_action :authenticate_user!

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
    end
  end
end
