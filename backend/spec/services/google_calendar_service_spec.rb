require "rails_helper"

RSpec.describe GoogleCalendarService do
  let!(:university) { University.create!(name: "Universidad de la República") }
  let!(:faculty)    { Faculty.create!(name: "Facultad de Ingeniería", university: university) }
  let!(:course)     { Course.create!(name: "Álgebra", faculty: faculty) }

  let!(:user) do
    User.create!(
      name: "Juan",
      last_name: "Pérez",
      email: "test@example.com",
      password: "password123",
      password_confirmation: "password123",
      google_access_token: "token123",
      calendar_id: "cal_1",
      faculty: faculty
    )
  end

  let(:google_service_double) { instance_double(Google::Apis::CalendarV3::CalendarService) }

  before do
    allow(Google::Apis::CalendarV3::CalendarService)
      .to receive(:new)
      .and_return(google_service_double)
    allow(google_service_double).to receive(:authorization=)
  end

  let(:service) { described_class.new(user) }

  describe "#create_event" do
    let(:tutoring) do
      Tutoring.create!(
        tutor: user,
        course: course,
        scheduled_at: 1.day.from_now,
        duration_mins: 60,
        modality: "virtual",
        event_id: "evt_1",
        capacity: 1
      )
    end

    let(:params) do
      {
        title: "Tutoría de Álgebra",
        description: "Repaso de parciales",
        start_time: Time.current.iso8601,
        end_time: 1.hour.since(Time.current).iso8601
      }
    end

    it "crea un evento y actualiza el tutoring" do
      fake_event = instance_double(Google::Apis::CalendarV3::Event, id: "event_123")
      allow(service).to receive(:ensure_calendar).and_return("cal_1")
      allow(google_service_double).to receive(:insert_event).and_return(fake_event)

      result = service.create_event(tutoring, params)

      expect(result.id).to eq("event_123")
      expect(tutoring.reload.event_id).to eq("event_123")
      expect(google_service_double).to have_received(:insert_event).with(
        "cal_1",
        instance_of(Google::Apis::CalendarV3::Event)
      )
    end
  end

  describe "#join_event" do
    let(:attendee_email) { "student@test.com" }
    let(:tutoring) do
      Tutoring.create!(
        tutor: user,
        course: course,
        scheduled_at: 1.day.from_now,
        duration_mins: 60,
        modality: "virtual",
        event_id: "event_1",
        capacity: 1
      )
    end

    let(:event) { Google::Apis::CalendarV3::Event.new(id: "event_1", attendees: []) }

    before do
      allow(google_service_double).to receive(:get_event).and_return(event)
      allow(google_service_double).to receive(:update_event).and_return(event)
    end

    it "agrega un nuevo attendee y actualiza el evento" do
      service.join_event(tutoring, attendee_email)

      expect(event.attendees.map(&:email)).to include(attendee_email)
      expect(google_service_double).to have_received(:update_event).with("cal_1", "event_1", event)
    end

    it "lanza error si tutoring no tiene event_id" do
      tutoring.update!(event_id: nil)
      expect {
        service.join_event(tutoring, attendee_email)
      }.to raise_error("Tutoría no tiene evento en Google Calendar")
    end
  end

  describe "#delete_event" do
    let(:tutoring) do
      Tutoring.create!(
        tutor: user,
        course: course,
        scheduled_at: 1.day.from_now,
        duration_mins: 60,
        modality: "virtual",
        event_id: "event_99",
        capacity: 1
      )
    end

    it "borra el evento y limpia el event_id" do
      allow(google_service_double).to receive(:delete_event).and_return(true)

      service.delete_event(tutoring)

      expect(google_service_double).to have_received(:delete_event).with("cal_1", "event_99")
      expect(tutoring.reload.event_id).to be_nil
    end
  end

  describe "#ensure_calendar" do
    it "devuelve calendar_id si ya existe" do
      result = service.ensure_calendar(user)
      expect(result).to eq("cal_1")
    end

    it "crea un calendario si no existe" do
      user.update!(calendar_id: nil)
      fake_calendar = instance_double(Google::Apis::CalendarV3::Calendar, id: "new_cal")
      allow(google_service_double).to receive(:insert_calendar).and_return(fake_calendar)

      result = service.ensure_calendar(user)

      expect(result).to eq("new_cal")
      expect(user.reload.calendar_id).to eq("new_cal")
    end
  end

  describe "#refresh_google_token" do
    it "refresca el token con Signet" do
      user.update!(google_refresh_token: "refresh123", google_access_token: nil)

      fake_client = instance_double(
        Signet::OAuth2::Client,
        access_token: "newtoken",
        expires_in: 3600
      )

      allow(Signet::OAuth2::Client).to receive(:new).and_return(fake_client)
      allow(fake_client).to receive(:fetch_access_token!)

      result = service.send(:refresh_google_token, user)

      expect(result).to eq("newtoken")
      expect(user.reload.google_access_token).to eq("newtoken")
    end
  end
end
