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

  def test_reminder
    tutoring_id = params[:tutoring_id]

    if tutoring_id.blank?
      return render json: { error: "tutoring_id es requerido" }, status: :bad_request
    end

    begin
      TutoringReminderJob.perform_now(tutoring_id)

      render json: {
        ok: true,
        message: "TutoringReminderJob ejecutado exitosamente para tutoring_id: #{tutoring_id}",
        tutoring_id: tutoring_id
      }
    rescue => e
      render json: {
        error: "Error ejecutando TutoringReminderJob: #{e.message}",
        tutoring_id: tutoring_id
      }, status: :internal_server_error
    end
  end
end
