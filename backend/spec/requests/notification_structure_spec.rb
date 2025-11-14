require "rails_helper"
require "active_job/test_helper"

RSpec.describe "Notifications Actions", type: :request do
  include ActiveJob::TestHelper
  include Devise::Test::IntegrationHelpers

  def json
    response.parsed_body
  end

  def create_notification_for(user, title:, attrs: {})
    # Crear evento de Noticed y la notificación vinculada directamente para tests.
    event = Noticed::Event.create!(type: "PingNotifier", params: { title: title })
    notif_attrs = {
      title: title,
      event: event
    }
    # permitir override de timestamps / campos por attrs
    notif_attrs[:created_at] = attrs.delete(:created_at) if attrs.key?(:created_at)
    notif_attrs[:read_at]    = attrs.delete(:read_at)    if attrs.key?(:read_at)
    notif_attrs[:seen_at]    = attrs.delete(:seen_at)    if attrs.key?(:seen_at)

    n = user.notifications.create!(**notif_attrs)
    # aplicar cualquier otro atributo restante
    n.update!(attrs) if attrs.present?
    n.reload
  end

  let!(:universidad) { University.create!(name: "Universidad de Ejemplo") }
  let!(:facultad) { Faculty.create!(name: "Facultad de Ingeniería", university: universidad) }

  let!(:user) do
    User.create!(
      email: "user@example.com",
      password: "password",
      password_confirmation: "password",
      name: "User",
      last_name: "Test",
      faculty: facultad
    )
  end

  let!(:other) do
    User.create!(
      email: "other@example.com",
      password: "password",
      password_confirmation: "password",
      name: "Other",
      last_name: "Test",
      faculty: facultad
    )
  end

  before { sign_in user }

  describe "GET /api/v1/notifications" do
    it "requiere autenticación" do
      sign_out user
      get "/api/v1/notifications"
      expect(response).to have_http_status(:found).or have_http_status(:unauthorized)
    end

    it "devuelve solo las notificaciones del usuario y en el orden esperado" do
      create_notification_for(
        user,
        title: "N1",
        attrs: { created_at: 1.minute.ago, read_at: Time.current, seen_at: Time.current }
      )
      create_notification_for(
        user,
        title: "N2",
        attrs: { created_at: 2.minutes.ago, read_at: Time.current, seen_at: Time.current }
      )
      create_notification_for(user, title: "N3", attrs: { created_at: 1.minute.ago })
      create_notification_for(other, title: "Otra", attrs: { created_at: Time.current })

      get "/api/v1/notifications"
      expect(response).to have_http_status(:ok)

      payload = json.fetch("notifications")
      # Ordena no leídas (read_at IS NULL) primero, luego por created_at desc
      expect(payload.pluck("title")).to contain_exactly("N1", "N2", "N3")
      expect(payload.first["read_at"]).to be_nil
      expect(payload.first["title"]).to eq("N3")
      expect(payload.second["title"]).to eq("N1")
      expect(payload.third["title"]).to eq("N2")
      expect(payload.first.keys).to include("id", "title", "created_at", "read_at", "seen_at")
    end
  end

  describe "PUT /api/v1/notifications/:id (mark read / seen)" do
    it "marca read_at cuando recibe read: true" do
      n = create_notification_for(user, title: "N1", attrs: { created_at: Time.current })
      put "/api/v1/notifications/#{n.id}",
          params: { read: true }.to_json,
          headers: { "CONTENT_TYPE" => "application/json" }
      expect(response).to have_http_status(:ok)
      expect(n.reload.read_at).not_to be_nil
    end

    it "marca seen_at cuando recibe seen: true" do
      n = create_notification_for(user, title: "N1", attrs: { created_at: Time.current })
      put "/api/v1/notifications/#{n.id}",
          params: { seen: true }.to_json,
          headers: { "CONTENT_TYPE" => "application/json" }
      expect(response).to have_http_status(:ok)
      expect(n.reload.seen_at).not_to be_nil
    end

    it "no permite actualizar notificaciones de otros usuarios" do
      other_n = create_notification_for(other, title: "Otro", attrs: { created_at: Time.current })
      put "/api/v1/notifications/#{other_n.id}", params: { read: true }
      expect(response).to have_http_status(:not_found).or have_http_status(:forbidden)
      expect(other_n.reload.read_at).to be_nil
    end
  end

  describe "POST /api/v1/notifications/mark_all_read" do
    it "marca todas las notificaciones no leídas como leídas" do
      create_notification_for(user, title: "N1")
      create_notification_for(user, title: "N2")
      create_notification_for(user, title: "Otro", attrs: { read_at: Time.current })

      post "/api/v1/notifications/mark_all_read"
      expect(response).to have_http_status(:ok)

      expect(user.notifications.unscoped.where(read_at: nil).count).to eq(0)
      expect(user.notifications.where.not(read_at: nil).count).to be >= 3
    end
  end

  describe "POST /api/v1/notifications/mark_all_seen" do
    it "marca seen_at solo en las que tenían seen_at nil" do
      seen_ts = 1.day.ago
      n1 = create_notification_for(user, title: "N1", attrs: { seen_at: seen_ts })
      n2 = create_notification_for(user, title: "N2", attrs: { seen_at: nil })

      post "/api/v1/notifications/mark_all_seen"
      expect(response).to have_http_status(:ok)

      expect(n1.reload.seen_at.to_i).to eq(seen_ts.to_i)
      expect(n2.reload.seen_at).not_to be_nil
    end
  end

  describe "POST /api/v1/notification_token" do
    it "devuelve un token para actioncable" do
      post "/api/v1/notification_token"
      expect(response).to have_http_status(:ok)
      body = json
      expect(body).to have_key("notifToken")
      expect(body["notifToken"]).to be_a(String)
      expect(body["notifToken"].length).to be > 10
    end

    it "requiere autenticación" do
      sign_out user
      post "/api/v1/notification_token"
      expect(response).to have_http_status(:found).or have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/notifications/:id" do
    it "elimina la notificación del usuario" do
      n = create_notification_for(user, title: "N1", attrs: { created_at: Time.current })
      delete "/api/v1/notifications/#{n.id}"
      expect(response).to have_http_status(:ok)
      expect { n.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it "no permite eliminar notificaciones de otro usuario" do
      other_n = create_notification_for(other, title: "Otro", attrs: { created_at: Time.current })
      delete "/api/v1/notifications/#{other_n.id}"
      expect(response).to have_http_status(:not_found).or have_http_status(:forbidden)
      expect(other_n.reload).to be_present
    end
  end

  describe "DELETE /api/v1/notifications/destroy_all" do
    it "elimina todas las notificaciones del usuario" do
      create_notification_for(user, title: "N1")
      create_notification_for(user, title: "N2")
      delete "/api/v1/notifications/destroy_all"
      expect(response).to have_http_status(:ok)
      expect(user.notifications.count).to eq(0)
    end
  end
end
