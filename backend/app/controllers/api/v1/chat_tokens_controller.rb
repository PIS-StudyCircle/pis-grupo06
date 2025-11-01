class Api::V1::ChatTokensController < ApplicationController
  before_action :authenticate_user!

  def create
    token = Rails.application.message_verifier(:chat).generate(current_user.id)
    render json: { wsToken: token }
  end
end
