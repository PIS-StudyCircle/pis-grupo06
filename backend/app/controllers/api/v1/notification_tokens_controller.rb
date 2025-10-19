class Api::V1::NotificationTokensController < ApplicationController
  before_action :authenticate_user!

  def create
    token = Rails.application.message_verifier(:notif).generate(current_user.id)
    render json: { notifToken: token }
  end
end
