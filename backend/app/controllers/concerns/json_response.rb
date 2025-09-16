# frozen_string_literal: true

module JsonResponse
  extend ActiveSupport::Concern

  private

  def success_response(message:, data: nil, status: :ok)
    render json: {
      message: message,
      data: data
    }.compact, status: status
  end

  def error_response(message:, errors: nil, status: :unprocessable_entity)
    render json: {
      message: message,
      errors: errors
    }.compact, status: status
  end
end
