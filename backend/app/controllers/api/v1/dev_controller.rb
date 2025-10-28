# Para testear que funcione lo de action cable
class Api::V1::DevController < ApplicationController
  before_action :authenticate_user!

  def cable_test
    ActionCable.server.broadcast("users:#{current_user.id}:notifications", { ping: "hola" })
    render json: { ok: true }
  end

  def notify_test
    PingNotifier.with(url: "/", title: "Ping test").deliver(current_user)
    render json: { ok: true }
  end
end
