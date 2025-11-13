class Deapi
  class EditionError < StandardError; end

  BASE_URL = "https://api.deapi.ai/api/v1/client"
  MAX_RETRIES = 40
  RETRY_DELAY = 5
  ALLOWED_FORMATS = %w[jpg jpeg png gif bmp webp].freeze
  MAX_FILE_SIZE = 10.megabytes

  def initialize(api_key: ENV['DEAPI_KEY'])
    @api_key = api_key
  end

  def edit(image:, prompt:, **options)
    validate_image!(image)

    request_id = create_edition_request(image, prompt, options)
    return nil unless request_id

    fetch_result(request_id)
  end

  def generate(prompt:, **options)
    request_id = create_generation_request(prompt, options)
    fetch_result(request_id)
  end

  # Método público para obtener request_id de generación
  def create_generation_request(prompt, options = {})
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

    request_id
  end

  # Métodos públicos para uso en jobs
  def create_edition_request(image, prompt, options)
    uri = URI("#{BASE_URL}/img2img")

    Rails.logger.info "🔄 Creando request de edición..."

    begin
      form_data = build_form_data(image, prompt, options)
      Rails.logger.info "✅ Form data construido"

      request = build_multipart_request(uri, form_data)
      Rails.logger.info "✅ Request multipart construido"

      Rails.logger.info "📤 Enviando request a Deapi..."
      response = execute_request(uri, request)

      Rails.logger.info "📥 Respuesta recibida - Status: #{response.code}"
      Rails.logger.info "📥 Body: #{response.body[0..500]}"

      parsed = JSON.parse(response.body) rescue nil

      if parsed.nil?
        Rails.logger.error "❌ No se pudo parsear la respuesta"
        return nil
      end

      request_id = parsed&.dig("data", "request_id")
      Rails.logger.info "✅ Request ID obtenido: #{request_id}"

      request_id
    rescue => e
      Rails.logger.error "❌ Error en create_edition_request: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")
      raise
    end
  end

  def fetch_status(request_id)
    uri = URI("#{BASE_URL}/request-status/#{request_id}")
    request = build_get_request(uri)
    response = execute_request(uri, request)
    JSON.parse(response.body) rescue {}
  end

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
        raise EditionError, "Image edition failed: #{parsed.dig('data', 'error')}"
      end

      sleep RETRY_DELAY
    end

    raise EditionError, "Timeout waiting for image edition"
  end

  private

  def validate_image!(image)
    file = image.is_a?(String) ? File.open(image) : image

    if file.size > MAX_FILE_SIZE
      raise EditionError, "Image size exceeds #{MAX_FILE_SIZE / 1.megabyte}MB limit"
    end

    extension = File.extname(file.path).delete('.').downcase
    unless ALLOWED_FORMATS.include?(extension)
      raise EditionError, "Invalid format. Allowed: #{ALLOWED_FORMATS.join(', ')}"
    end
  end

  def build_form_data(image, prompt, options)
    Rails.logger.info "📦 Construyendo form data..."

    # Leer el contenido del archivo ANTES de construir el array
    file_content =
      if image.is_a?(String)
        File.read(image)
      else
        image.tempfile.rewind
        content = image.tempfile.read
        image.tempfile.rewind
        content
      end

    filename = if image.respond_to?(:original_filename)
                 image.original_filename
               elsif image.is_a?(String)
                 File.basename(image)
               else
                 'image.jpg'
               end

    Rails.logger.info "📦 Archivo: #{filename} (#{file_content.bytesize} bytes)"

    [
      ['prompt', prompt],
      ['negative_prompt', options[:negative_prompt] || 'blur, distortion, darkness, noise, artifacts'],
      ['image_content', file_content, { filename: filename }],
      ['model', options[:model] || 'stable-diffusion-v1-5'],
      ['guidance', options[:guidance] || 7.5],
      ['steps', options[:steps] || 10],
      ['seed', options[:seed] || rand(1000..9999)]
    ].tap do |data|
      if options[:loras].present?
        data << ['loras', options[:loras].to_json]
      end
    end
  end

  def build_multipart_request(uri, form_data)
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{@api_key}"
    request["Accept"] = "application/json"

    boundary = "----WebKitFormBoundary#{SecureRandom.hex(16)}"
    request["Content-Type"] = "multipart/form-data; boundary=#{boundary}"

    body = build_multipart_body(form_data, boundary)
    request.body = body

    request
  end

  def build_multipart_body(form_data, boundary)
    parts = form_data.map do |field_name, value, options = {}|
      if field_name == 'image_content'
        build_file_part_from_content('image', value, boundary, options)
      elsif value.respond_to?(:read)
        build_file_part(field_name, value, boundary, options)
      else
        build_field_part(field_name, value, boundary)
      end
    end

    # ✅ Forzar encoding binario para todo el body
    body = parts.join.force_encoding('BINARY')
    body += "--#{boundary}--\r\n".force_encoding('BINARY')
    body
  end

  def build_field_part(field_name, value, boundary)
    part = ""
    part << "--#{boundary}\r\n"
    part << "Content-Disposition: form-data; name=\"#{field_name}\"\r\n"
    part << "\r\n"
    part << "#{value}\r\n"
    part.force_encoding('BINARY')
  end

  def build_file_part_from_content(field_name, content, boundary, options = {})
    filename = options[:filename] || 'image.jpg'

    # Detectar MIME type desde el contenido
    content_type = begin
      Marcel::MimeType.for(StringIO.new(content), name: filename)
    rescue
      # Fallback: detectar por extensión
      case File.extname(filename).downcase
      when '.png'  then 'image/png'
      when '.gif'  then 'image/gif'
      when '.webp' then 'image/webp'
      else 'image/jpeg'
      end
    end

    # ✅ Construir parte del archivo con encoding binario
    part = ""
    part << "--#{boundary}\r\n"
    part << "Content-Disposition: form-data; name=\"#{field_name}\"; filename=\"#{filename}\"\r\n"
    part << "Content-Type: #{content_type}\r\n"
    part << "\r\n"
    part.force_encoding('BINARY')
    part << content.force_encoding('BINARY')
    part << "\r\n".force_encoding('BINARY')
    part
  end

  def build_file_part(field_name, file, boundary, options = {})
    filename = options[:filename] || 'image.png'
    content_type = Marcel::MimeType.for(file, name: filename) || 'application/octet-stream'

    content = file.read.force_encoding('BINARY')

    part = ""
    part << "--#{boundary}\r\n"
    part << "Content-Disposition: form-data; name=\"#{field_name}\"; filename=\"#{filename}\"\r\n"
    part << "Content-Type: #{content_type}\r\n"
    part << "\r\n"
    part.force_encoding('BINARY')
    part << content
    part << "\r\n".force_encoding('BINARY')
    part
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
