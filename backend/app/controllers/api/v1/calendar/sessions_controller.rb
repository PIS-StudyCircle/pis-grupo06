require 'googleauth'
require 'google/apis/calendar_v3'

class Api::V1::Calendar::SessionsController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/calendar/sessions?user_id=1
  def index
    user = User.find(params[:user_id])

    # refrescar token si está vencido
    if user.google_expires_at.nil? || user.google_expires_at < Time.now
        access_token = refresh_google_token(user)
    end


    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = user.google_access_token || access_token

    # obtener próximos eventos (ejemplo: los siguientes 10)
    result = service.list_events(
      'primary',
      max_results: 50,
      single_events: true,
      order_by: 'startTime',
      time_min: Time.now.iso8601
    )

    tutoring_events = result.items.select do |event|
      event.extended_properties&.private&.[]("app") == "tutorias"
    end

    sessions = tutoring_events.map do |event|
      {
        id: event.extended_properties.private["tutoring_id"].presence || event.id,
        subject: event.summary,
        tutor: user.name, 
        date: event.start.date_time || event.start.date,
        duration: event.end.date_time && event.start.date_time ? ((event.end.date_time - event.start.date_time) / 60).to_i : nil,
        location: event.location || "Sin ubicación",
        status: event.status, 
        topics: event.description.present? ? [event.description] : []
      }
    end

    # if sessions.empty?
    #     sessions = data
    # end

    render json: sessions
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /api/v1/calendar/sessions
  def create
    user = current_user
    access_token = refresh_google_token(user) if user.google_expires_at < Time.now

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = user.google_access_token || access_token

    event = Google::Apis::CalendarV3::Event.new(
      summary: params[:title],
      description: params[:description] || "",
      start: { date_time: params[:start_time], time_zone: 'America/Montevideo' },
      end:   { date_time: params[:end_time],   time_zone: 'America/Montevideo' },
      attendees: (params[:attendees] || []).map { |a| { email: a[:email] } },
      extended_properties: {
      private: {
        "tutoring_id" => params[:tutoring_id].to_s,
        "app" => "tutorias"   
      }
    }
    )

    result = service.insert_event('primary', event)
    render json: { success: true, event: result }
  rescue => e
    render json: { success: false, error: e.message }, status: :unprocessable_entity
  end

  def destroy
    user = current_user
    access_token = refresh_google_token(user) if user.google_expires_at < Time.now

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = user.google_access_token || access_token

    service.delete_event('primary', params[:id]) 

    render json: { success: true }
  rescue => e
    render json: { success: false, error: e.message }, status: :unprocessable_entity
  end

  private

  def refresh_google_token(user)
    client = Signet::OAuth2::Client.new(
      client_id: ENV['GOOGLE_CLIENT_ID'],
      client_secret: ENV['GOOGLE_CLIENT_SECRET'],
      token_credential_uri: 'https://oauth2.googleapis.com/token',
      refresh_token: user.google_refresh_token,
    )

    client.fetch_access_token!

    user.update!(
      google_access_token: client.access_token,
      google_expires_at: Time.now + client.expires_in
    )

    client.access_token
  end
end

def data
      sessions = [
    {
      id: 1,
      subject: "Matemáticas I",
      tutor: "Dr. Carlos Rodríguez",
      date: Time.new(2025, 9, 28, 10, 0, 0, "-03:00"),
      duration: 60,
      location: "Aula Virtual",
      status: "confirmada",
      topics: ["Derivadas", "Límites"]
    },
    {
      id: 2,
      subject: "Física II",
      tutor: "Ing. Ana Martínez",
      date: Time.new(2025, 9, 29, 14, 0, 0, "-03:00"),
      duration: 90,
      location: "Laboratorio 3",
      status: "pendiente",
      topics: ["Electromagnetismo", "Ondas"]
    },
    {
      id: 3,
      subject: "Química Orgánica",
      tutor: "Lic. Pedro Sánchez",
      date: Time.new(2025, 9, 30, 16, 0, 0, "-03:00"),
      duration: 75,
      location: "Aula Virtual",
      status: "confirmada",
      topics: ["Hidrocarburos", "Reacciones"]
    },
    {
      id: 4,
      subject: "Programación",
      tutor: "Ing. Laura González",
      date: Time.new(2025, 10, 2, 9, 0, 0, "-03:00"),
      duration: 120,
      location: "Lab. Informática",
      status: "confirmada",
      topics: ["Algoritmos", "Estructuras de datos"]
    }
  ]
end