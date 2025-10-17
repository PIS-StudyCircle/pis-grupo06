# frozen_string_literal: true

class GoogleCalendarService
  def initialize(user)
    @user = user
    @service = Google::Apis::CalendarV3::CalendarService.new
    @service.authorization = user.google_access_token || refresh_google_token(user)
  end

  # Crear evento (lo usa el tutor)
  def create_event(tutoring, params)
    calendar_id = ensure_calendar(@user)

    event = Google::Apis::CalendarV3::Event.new(
      summary: params[:title],
      description: params[:description] || "",
      start: { date_time: params[:start_time], time_zone: "America/Montevideo" },
      end: { date_time: params[:end_time], time_zone: "America/Montevideo" },
      extended_properties: {
        private: {
          "tutoring_id" => tutoring.id.to_s,
          "app" => "tutorias"
        }
      }
    )

    result = @service.insert_event(calendar_id, event)

    tutoring.update!(event_id: result.id)
    result
  end

  # Unirse a un evento (lo usa el estudiante)
  def join_event(tutoring, attendee_email)
    raise "Tutoría no tiene evento en Google Calendar" if tutoring.event_id.blank?

    owner = tutoring.tutor
    calendar_id = owner.calendar_id

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = owner.google_access_token

    event = service.get_event(calendar_id, tutoring.event_id)
    event.attendees ||= []

    # Verifica si ya está agregado
    unless event.attendees.any? { |a| a.email == attendee_email }
      new_attendee = Google::Apis::CalendarV3::EventAttendee.new(
        email: attendee_email,
        response_status: "accepted"
      )
      event.attendees << new_attendee
    end

    service.update_event(calendar_id, tutoring.event_id, event)
  end

  # Obtener un evento puntual
  def get_event(tutoring)
    calendar_id = tutoring_owner_calendar(tutoring)
    @service.get_event(calendar_id, tutoring.event_id)
  end

  # Próximos N eventos del calendario del usuario
  def list_upcoming_events(limit = 10)
    calendar_id = ensure_calendar(@user)
    @service.list_events(
      calendar_id,
      max_results: limit,
      single_events: true,
      order_by: "startTime",
      time_min: Time.now.iso8601
    ).items
  end

  # Borrar evento
  def delete_event(tutoring)
    calendar_id = tutoring_owner_calendar(tutoring)
    @service.delete_event(calendar_id, tutoring.event_id)
    tutoring.update!(event_id: nil)
  end

  # Crear el calendario StudyCircle si no existe
  def ensure_calendar(user)
    return user.calendar_id if user.calendar_id.present?

    calendar = Google::Apis::CalendarV3::Calendar.new(
      summary: "StudyCircle",
      description: "Calendario dedicado a las tutorías de StudyCircle",
      time_zone: "America/Montevideo"
    )

    result = @service.insert_calendar(calendar)
    user.update!(calendar_id: result.id)
    result.id
  end

  private

  def refresh_google_token(user)
    return nil if user.google_refresh_token.blank?
    
    client = Signet::OAuth2::Client.new(
      client_id: ENV["GOOGLE_CLIENT_ID"],
      client_secret: ENV["GOOGLE_CLIENT_SECRET"],
      token_credential_uri: "https://oauth2.googleapis.com/token",
      refresh_token: user.google_refresh_token,
      grant_type: "refresh_token"
      )

    client.fetch_access_token!

    user.update!(
      google_access_token: client.access_token,
      google_expires_at: Time.zone.now + client.expires_in
    )

    client.access_token
  end

  # Obtener el calendar_id del tutor dueño de la tutoría
  def tutoring_owner_calendar(tutoring)
    Rails.logger.debug tutoring.inspect
    tutoring.tutor.calendar_id || ensure_calendar(tutoring.tutor)
  end
end
