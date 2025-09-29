require 'googleauth'
require 'google/apis/calendar_v3'

class Api::V1::Calendar::SessionsController < ApplicationController
  before_action :authenticate_user!

  def translate_response_status(status)
    case status
    when "needsAction" then "pendiente"
    when "accepted"    then "confirmada"
    when "declined"    then "rechazada"
    when "tentative"   then "tentativa"
    else "desconocido"
    end
  end

  def session_status(event, attendees)
    return "cancelada" if event.status == "cancelled"
    return "rechazada" if attendees&.any? { |a| a[:status] == "rechazada" }
    return "pendiente" if attendees&.any? { |a| a[:status] == "pendiente" }
    return "tentativa" if attendees&.any? { |a| a[:status] == "tentativa" }
    return "confirmada" if attendees&.all? { |a| a[:status] == "confirmada" }
    "desconocido"
  end

  # GET /api/v1/calendar/sessions?user_id=id&type=type
  def index
    user = User.find(params[:user_id])
    access_token = refresh_google_token(user) if user.google_expires_at.nil? || user.google_expires_at < Time.now

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = user.google_access_token || access_token

    calendar_list = service.list_calendar_lists
    all_events = []

    calendar_list.items.each do |cal|
      events = service.list_events(
        cal.id,
        max_results: 50,
        single_events: true,
        order_by: 'startTime',
        time_min: Time.now.iso8601,
        fields: 'items(id,summary,description,start,end,attendees,organizer,creator,status,location,htmlLink)'
      )
      all_events.concat(events.items)
    end

    my_email = user.email
    type = params[:type]

    filtered_events = case type
    when "organized"
      all_events.select { |event| event.organizer&.email == my_email }
    when "invited"
      all_events.select do |event|
        event.organizer&.email != my_email &&
          event.attendees&.any? { |a| a.email == my_email }
      end
    when "all", nil
      all_events
    else
      all_events
    end

    sessions = filtered_events.map do |event|
      attendee_status = event.attendees&.map do |a|
        { email: a.email, status: translate_response_status(a.response_status) }
      end

      {
        id: event.id,
        subject: event.summary,
        tutor: event.organizer&.display_name || event.organizer&.email || "Desconocido",
        date: event.start.date_time || event.start.date,
        duration: if event.end.date_time && event.start.date_time
                    start_time = event.start.date_time.to_time
                    end_time   = event.end.date_time.to_time
                    ((end_time - start_time) / 60).to_i
                  else
                    nil
                  end,
        location: event.location || "Sin ubicación",
        status: session_status(event, attendee_status),
        attendees: attendee_status,
        topics: event.description.present? ? [event.description] : [],
        url: event.html_link
      }
    end

    render json: sessions
  rescue => e
    render json: { error: e.message }, status: :unprocessable_content
  end

  # POST /api/v1/calendar/sessions
  def create
    user = current_user
    access_token = refresh_google_token(user) if user.google_expires_at < Time.now

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = user.google_access_token || access_token

    calendar_id = ensure_calendar(user, service)

    event = Google::Apis::CalendarV3::Event.new(
      summary: params[:title],
      description: params[:description] || "",
      start: { date_time: params[:start_time], time_zone: 'America/Montevideo' },
      end:   { date_time: params[:end_time],   time_zone: 'America/Montevideo' },
      attendees: (params[:attendees] || []).map { |a| { email: a[:email] } }
    )

    result = service.insert_event(calendar_id, event)
    Rails.logger.info "Evento creado en #{calendar_id}: #{result.to_h}"
    render json: { success: true, event: result }
  rescue => e
    render json: { success: false, error: e.message }, status: :unprocessable_content
  end

  def destroy
    user = current_user
    access_token = refresh_google_token(user) if user.google_expires_at < Time.now

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = user.google_access_token || access_token

    calendar_id = ensure_calendar(user, service)

    service.delete_event(calendar_id, params[:id])
    render json: { success: true }
  rescue => e
    render json: { success: false, error: e.message }, status: :unprocessable_content
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

  # crea o recupera el calendario StudyCircle del usuario
  def ensure_calendar(user, service)
    return user.calendar_id if user.calendar_id.present?

    calendar = Google::Apis::CalendarV3::Calendar.new(
      summary: "StudyCircle",
      description: "Calendario dedicado a las tutorías de StudyCircle",
      time_zone: "America/Montevideo"
    )

    result = service.insert_calendar(calendar)
    user.update!(calendar_id: result.id)
    result.id
  end
end
