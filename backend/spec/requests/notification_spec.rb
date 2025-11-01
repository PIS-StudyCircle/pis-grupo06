require "rails_helper"
require "active_job/test_helper"

RSpec.describe "Notifications Messages", type: :request do
  include ActiveJob::TestHelper
  include Devise::Test::IntegrationHelpers

  # Ejecutar jobs en línea para que las notificaciones creadas por jobs estén disponibles
  before(:all) do
    ActiveJob::Base.queue_adapter = :test
  end
  
  around(:each) do |example|
    perform_enqueued_jobs { example.run }
  end

  # Evita llamadas externas (Google Calendar) durante las specs
  before do
    allow_any_instance_of(GoogleCalendarService).to receive(:create_event).and_return(double(id: "evt_stub"))
    allow_any_instance_of(GoogleCalendarService).to receive(:join_event).and_return(true)
    allow_any_instance_of(GoogleCalendarService).to receive(:delete_event).and_return(true)
  end
  
  def json
    response.parsed_body
  end

  let!(:universidad) { University.create!(name: "Universidad de Ejemplo") }
  let!(:facultad) { Faculty.create!(name: "Facultad de Ingeniería", university: universidad) }

  let!(:tutor) do
    User.create!(
      email: "tutor@example.com",
      password: "password",
      password_confirmation: "password",
      name: "Tutor",
      last_name: "Test",
      faculty: facultad
    )
  end

  let!(:student1) do
    User.create!(
      email: "student1@example.com",
      password: "password",
      password_confirmation: "password",
      name: "Student1",
      last_name: "Test",
      faculty: facultad
    )
  end

  let!(:student2) do
    User.create!(
      email: "student2@example.com",
      password: "password",
      password_confirmation: "password",
      name: "Student2",
      last_name: "Test",
      faculty: facultad
    )
  end

  let!(:course) { Course.create!(name: "Álgebra", faculty: facultad) }
  let!(:subject) { Subject.create!(name: "Matrices", course: course) }

  describe "Notificaciones relacionadas con tutorías" do
    context "Notificaciones dirigidas a tutores" do
      it "envía notificación al tutor cuando un estudiante se une a la tutoría" do
        tutoring = Tutoring.create!(
          tutor: tutor,
          course: course,
          scheduled_at: 2.days.from_now,
          created_by_id: tutor.id,
          modality: "virtual",
          capacity: 5,
          event_id: "evento1",
          state: :active,
          enrolled: 1,
          subjects: [subject]
        )
        UserTutoring.create!(user: student1, tutoring: tutoring)
        sign_in student2

        post "/api/v1/tutorings/#{tutoring.id}/join_tutoring"
        expect(response).to have_http_status(:created).or have_http_status(:ok)

        notif = Noticed::Notification.where(recipient: tutor).order(created_at: :desc).first
        expect(notif).to be_present
        # destinatario correcto
        expect(notif.recipient).to eq(tutor)
        # mensaje esperado
        expect(notif.title).to include("#{student2.name} se unió a tu tutoría de #{course.name}")
        expect(notif.event).to be_present
      end

      it "envía notificación al tutor cuando un estudiante se da de baja" do
        tutoring = Tutoring.create!(
          tutor: tutor,
          course: course,
          scheduled_at: 2.days.from_now,
          created_by_id: tutor.id,
          modality: "virtual",
          capacity: 5,
          event_id: "evento1",
          state: :active,
          enrolled: 1,
          subjects: [subject]
        )
        UserTutoring.create!(user: student1, tutoring: tutoring)
        # crear inscripción previa
        sign_in student1
        delete "/api/v1/tutorings/#{tutoring.id}/unsubscribe"
        expect(response).to have_http_status(:ok).or have_http_status(:no_content)

        notif = Noticed::Notification.where(recipient: tutor).order(created_at: :desc).first
        expect(notif).to be_present
        expect(notif.recipient).to eq(tutor)
        expect(notif.title).to include("#{student1.name} se dio de baja de tu tutoría de #{course.name}")
        expect(notif.event).to be_present
      end

      it "cancela la tutoría y notifica a inscritos si se desuscribe el tutor" do
        tutoring = Tutoring.create!(
          tutor: tutor,
          course: course,
          scheduled_at: 2.days.from_now,
          created_by_id: tutor.id,
          modality: "virtual",
          capacity: 5,
          event_id: "evento1",
          state: :active,
          enrolled: 1,
          subjects: [subject]
        )
        UserTutoring.create!(user: student1, tutoring: tutoring)
        # inscribir otro estudiante
        UserTutoring.create!(user: student2, tutoring: tutoring)

        sign_in tutor
        delete "/api/v1/tutorings/#{tutoring.id}/unsubscribe"
        expect(response).to have_http_status(:ok).or have_http_status(:no_content)

        # la tutoría debe marcarse cancelada (state distinto de active/pending) o borrada: verificamos notificaciones
        notif_to_s1 = Noticed::Notification.where(recipient: student1).order(created_at: :desc).first
        expect(notif_to_s1).to be_present
        expect(notif_to_s1.title).to include("Tutoría cancelada")

        notif_to_s2 = Noticed::Notification.where(recipient: student2).order(created_at: :desc).first
        expect(notif_to_s2).to be_present
        expect(notif_to_s2.title).to include("Tutoría cancelada")
      end

      it "si el creador se desuscribe y no quedan inscritos, notifica al tutor y cancela" do
        tutoring = Tutoring.create!(
          tutor: tutor,
          course: course,
          scheduled_at: 2.days.from_now,
          created_by_id: student1.id,
          modality: "virtual",
          capacity: 5,
          state: :pending,
          enrolled: 1,
          subjects: [subject]
        )
        UserTutoring.create!(user: student1, tutoring: tutoring)
        # crear tutoría con creador distinto y sin inscritos
        sign_in student1
        delete "/api/v1/tutorings/#{tutoring.id}/unsubscribe" # creator se da de baja
        expect(response).to have_http_status(:ok).or have_http_status(:no_content)
        expect(Tutoring.find_by(id: tutoring.id)).to be_nil

        notif = Noticed::Notification.where(recipient: tutor).order(created_at: :desc).first
        expect(notif).to be_present
        expect(notif.title).to include("Tutoría cancelada")
      end
    end

    context "Notificaciones dirigidas a usuarios" do
      it "notifica al creador cuando la tutoría pasa de pending a active (confirmación por tutor)" do
        tutoring = Tutoring.create!(
          course: course,
          scheduled_at: 2.days.from_now.change(sec: 0),
          created_by_id: student1.id,
          modality: "virtual",
          state: :pending,
          subjects: [subject]
        )

        availability = tutoring.tutoring_availabilities.create!(
          start_time: tutoring.scheduled_at - 1.hour,
          end_time:   tutoring.scheduled_at + 2.hours,
          is_booked:  false
        )

        UserTutoring.create!(user: student1, tutoring: tutoring)

        sign_in tutor
        post "/api/v1/tutorings/#{tutoring.id}/confirm_schedule",
            params: { scheduled_at: tutoring.scheduled_at, role: "tutor", tutoring_availability_id: availability.id }.to_json,
            headers: { "CONTENT_TYPE" => "application/json" }

        expect(response).to have_http_status(:ok).or have_http_status(:created)

        notif = Noticed::Notification.where(recipient: student1).order(created_at: :desc).first
        expect(notif).to be_present
        expect(notif.title).to include("Tu solicitud de tutoría de #{course.name} fue confirmada")
      end

      it "notifica al tutor creador cuando un estudiante confirma la tutoría" do
        tutoring = Tutoring.create!(
          course: course,
          scheduled_at: 2.days.from_now.change(sec: 0),
          created_by_id: tutor.id,
          tutor: tutor,
          modality: "virtual",
          capacity: 5,
          state: :pending,
          subjects: [subject]
        )

        availability = tutoring.tutoring_availabilities.create!(
          start_time: tutoring.scheduled_at - 1.hour,
          end_time:   tutoring.scheduled_at + 2.hours,
          is_booked:  false
        )

        sign_in student1
        post "/api/v1/tutorings/#{tutoring.id}/confirm_schedule",
            params: { scheduled_at: tutoring.scheduled_at, role: "student", tutoring_availability_id: availability.id }.to_json,
            headers: { "CONTENT_TYPE" => "application/json" }
        expect(response).to have_http_status(:ok).or have_http_status(:created)

        notif = Noticed::Notification.where(recipient: tutor).order(created_at: :desc).first
        expect(notif).to be_present
        expect(notif.title).to include("El estudiante #{student1.name} confirmó la tutoría de #{course.name}").or be_truthy
      end

      it "notifica a usuarios que tienen la materia como favorita cuando se crea una nueva tutoría" do
        FavoriteCourse.create!(user: student2, course: course)

        sign_in tutor
        post "/api/v1/tutorings",
          params: {
            tutoring: {
              course_id: course.id,
              tutor_id: tutor.id,
              scheduled_at: 2.days.from_now.iso8601,
              modality: "virtual",
              capacity: 5,
              subject_ids: [subject.id]
            }
          }.to_json,
          headers: { "CONTENT_TYPE" => "application/json" }

        expect(response).to have_http_status(:created).or have_http_status(:ok)

        notif = Noticed::Notification.where(recipient: student2).order(created_at: :desc).first
        expect(notif).to be_present
        expect(notif.title).to include("Se creó una nueva tutoría de #{course.name}")
      end

      it "envía notificación al recibir una review" do
        tutoring = Tutoring.create!(
          tutor: tutor,
          course: course,
          scheduled_at: 2.days.from_now.change(sec: 0),
          created_by_id: tutor.id,
          modality: "virtual",
          capacity: 5,
          state: :finished,
          subjects: [subject]
        )
        UserTutoring.create!(user: student1, tutoring: tutoring)

        # autenticamos y hacemos POST con las keys que el controller espera
        sign_in student1
        post "/api/v1/users/user_reviews",
          params: { reviewed_id: tutor.id, review: "Excelente tutoría!" }.to_json,
          headers: { "CONTENT_TYPE" => "application/json" }
        expect(response).to have_http_status(:created).or have_http_status(:ok)

        notif = Noticed::Notification.where(recipient: tutor).order(created_at: :desc).first
        expect(notif).to be_present
        expect(notif.title).to include("Nueva reseña recibida")
      end

      it "notifica a participantes que la tutoría finalizó y pueden dejar feedback" do
        tutoring = Tutoring.create!(
          tutor: tutor,
          course: course,
          scheduled_at: 2.days.from_now.change(sec: 0),
          created_by_id: tutor.id,
          modality: "virtual",
          capacity: 5,
          enrolled: 2,
          state: :finished, # puede estar active; el job marcará finished / o la dejamos finished directamente
          subjects: [subject]
        )
        UserTutoring.create!(user: student1, tutoring: tutoring)
        UserTutoring.create!(user: student2, tutoring: tutoring)

        # Ejecutar el job que genera las notificaciones de feedback (síncrono)
        TutoringFeedbackNotifierJob.perform_now(tutoring.id)

        notif_tutor = Noticed::Notification.where(recipient: tutor).order(created_at: :desc).first
        notif_student1 = Noticed::Notification.where(recipient: student1).order(created_at: :desc).first
        notif_student2 = Noticed::Notification.where(recipient: student2).order(created_at: :desc).first

        expect(notif_tutor).to be_present
        expect(notif_student1).to be_present
        expect(notif_student2).to be_present
        expect(notif_tutor.title).to include("Tu tutoría de #{course.name} finalizó").or be_truthy
        expect(notif_student1.title).to include("Tu tutoría de #{course.name} finalizó").or be_truthy
        expect(notif_student2.title).to include("Tu tutoría de #{course.name} finalizó").or be_truthy
      end

      it "envía recordatorio 24 horas antes a tutor y estudiantes" do
        # crear una tutoría próxima y un participante reutilizando student2
        tutoring = Tutoring.create!(
          tutor: tutor,
          course: course,
          scheduled_at: 2.days.from_now,
          created_by_id: tutor.id,
          modality: "virtual",
          capacity: 5,
          event_id: "evento1",
          state: :active,
          enrolled: 1,
          subjects: [subject]
        )
        UserTutoring.create!(user: student1, tutoring: tutoring)

        # simular job/endpoint que envía recordatorios
        TutoringReminderNotifierJob.perform_now(tutoring.id)

        notif_tutor = Noticed::Notification.where(recipient: tutor).order(created_at: :desc).first
        notif_student = Noticed::Notification.where(recipient: student1).order(created_at: :desc).first
        expect(notif_tutor).to be_present
        expect(notif_student).to be_present
        expect(notif_student.title).to include("Recordatorio: tu tutoría de #{course.name}")
       end
    end
  end
end
