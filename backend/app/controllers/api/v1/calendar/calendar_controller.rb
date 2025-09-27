require 'googleauth'
require 'google/apis/calendar_v3'

class Api::V1::Calendar::Controller < ApplicationController
  # POST /api/calendar/events
  def create_event
    user = current_user

    # 🔹 refrescar el token si está vencido
    access_token = refresh_google_token(user) if user.google_expires_at < Time.now

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = user.google_access_token || access_token

    # 🔹 parámetros que llegan del frontend
    title       = params[:title]
    description = params[:description] || ""
    start_time  = params[:start_time] # formato ISO8601 ej: "2025-09-30T10:00:00-03:00"
    end_time    = params[:end_time]   # idem
    attendees   = params[:attendees] || [] # [{ email: "alumno@example.com" }]

    # 🔹 definir el evento
    event = Google::Apis::CalendarV3::Event.new(
      summary: title,
      description: description,
      start: { date_time: start_time, time_zone: 'America/Montevideo' },
      end:   { date_time: end_time, time_zone: 'America/Montevideo' },
      attendees: attendees.map { |a| { email: a[:email] } }
    )

    # 🔹 insertar en calendario principal del usuario
    result = service.insert_event('primary', event)

    render json: { success: true, event: result }
  rescue => e
    render json: { success: false, error: e.message }, status: :unprocessable_entity
  end

  private

  # 🔄 refrescar token si expiró
  def refresh_google_token(user)
    client = Signet::OAuth2::Client.new(
      client_id: ENV['GOOGLE_CLIENT_ID'],
      client_secret: ENV['GOOGLE_CLIENT_SECRET'],
      token_credential_uri: 'https://oauth2.googleapis.com/token',
      refresh_token: user.google_refresh_token,
      grant_type: 'refresh_token'
    )

    client.fetch_access_token!

    user.update!(
      google_access_token: client.access_token,
      google_expires_at: Time.now + client.expires_in
    )

    client.access_token
  end
end
