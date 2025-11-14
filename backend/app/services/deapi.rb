class Deapi
  class EditionError < StandardError; end

  BASE_URL = "https://api.deapi.ai/api/v1/client"
  MAX_RETRIES = 40
  RETRY_DELAY = 5

  def initialize(api_key: ENV['DEAPI_KEY'])
    @api_key = api_key
  end

  def generate(prompt:, **options)
    uri = URI("#{BASE_URL}/txt2img")

    body = {
      prompt: prompt,
      negative_prompt: options[:negative_prompt] || "blur, distortion, darkness, noise",
      model: options[:model] || "Flux1schnell",
      width: options[:width] || 512,
      height: options[:height] || 512,
      guidance: options[:guidance] || 7.5,
      steps: options[:steps] || 10,
      seed: options[:seed] || rand(1000..9999)
    }
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{@api_key}"
    request["Accept"] = "application/json"
    request["Content-Type"] = "application/json"
    request.body = body.to_json

    response = execute_request(uri, request)
    parsed = JSON.parse(response.body) rescue nil
    request_id = parsed&.dig("data", "request_id")

    unless request_id
      raise EditionError, "No se pudo obtener el request_id para la generación de imagen"
    end

    fetch_result(request_id)
  end

  private

  def fetch_result(request_id)
    uri = URI("#{BASE_URL}/request-status/#{request_id}")

    MAX_RETRIES.times do
      request = build_get_request(uri)
      response = execute_request(uri, request)
      parsed = JSON.parse(response.body) rescue {}

      status = parsed.dig("data", "status")

      case status
      when "done"
        return parsed.dig("data", "result_url")
      when "failed", "error"
        raise EditionError, "Image generation failed: #{parsed.dig('data', 'error')}"
      end

      sleep RETRY_DELAY
    end

    raise EditionError, "Timeout waiting for image generation"
  end

  def build_get_request(uri)
    Net::HTTP::Get.new(uri).tap do |req|
      req["Authorization"] = "Bearer #{@api_key}"
      req["Accept"] = "application/json"
    end
  end

  def execute_request(uri, request)
    Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end
  end
end
