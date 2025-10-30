require 'rails_helper'

RSpec.describe Tutorings::MarkFinishedTutoringsJob, type: :job do
  let(:current_time) { Time.current }
  let!(:university) { University.create!(name: "UDELAR") }
  let!(:faculty) { Faculty.create!(name: "Ingeniería", university: university) }
  let!(:course) { Course.create!(name: "Física", faculty: faculty) }
  let!(:tutor) do
    User.create!(
      name: "Tutor",
      last_name: "Test",
      email: "tutor@mail.com",
      password: "password123",
      password_confirmation: "password123",
      faculty: faculty
    )
  end

  before do
    allow(Time).to receive(:current).and_return(current_time)
  end

  describe "#perform" do
    context "cuando la tutoría ya finalizó" do
      let!(:finished_tutoring) do
        Tutoring.new(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          duration_mins: 60,
          scheduled_at: current_time - 2.hours,
          state: "active"
        ).tap { |t| t.save(validate: false) }
      end

      it "marca la tutoría como finished" do
        described_class.perform_now

        expect(finished_tutoring.reload).to be_finished
      end
    end

    context "cuando la tutoría aún no finalizó" do
      let!(:active_tutoring) do
        Tutoring.new(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          duration_mins: 120,
          scheduled_at: current_time - 30.minutes,
          state: "active"
        ).tap { |t| t.save(validate: false) }
      end

      it "no modifica el estado de la tutoría" do
        described_class.perform_now

        expect(active_tutoring.reload).to be_active
      end
    end

    context "cuando hay múltiples tutorías finalizadas" do
      let!(:multiple_finished_tutorings) do
        Array.new(3) do |i|
          Tutoring.new(
            course: course,
            tutor: tutor,
            capacity: 5,
            modality: "virtual",
            duration_mins: 60,
            scheduled_at: current_time - (i + 2).hours,
            state: "active"
          ).tap { |t| t.save(validate: false) }
        end
      end

      it "marca todas las tutorías finalizadas" do
        expect {
          described_class.perform_now
        }.to change { Tutoring.where(state: Tutoring.states[:finished]).count }.by(3)
      end
    end

    context "cuando ocurre un error en el proceso" do
      let!(:error_tutoring) do
        Tutoring.new(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          duration_mins: 60,
          scheduled_at: current_time - 2.hours,
          state: "active"
        ).tap { |t| t.save(validate: false) }
      end

      before do
        allow(Rails.logger).to receive(:error)
        allow_any_instance_of(Tutoring).to receive(:update!).and_raise(StandardError, "Fallo controlado")
      end

      it "registra el error pero continúa" do
        expect { described_class.perform_now }.not_to raise_error

        expect(Rails.logger).to have_received(:error).with(a_string_matching(/Fallo controlado/))
      end
    end

    context "cuando hay tutorías pending con todas las availabilities vencidas" do
      let!(:pending_tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_availability1) do
        TutoringAvailability.create!(
          tutoring: pending_tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour
        )
      end

      let!(:expired_availability2) do
        TutoringAvailability.create!(
          tutoring: pending_tutoring,
          start_time: current_time - 4.hours,
          end_time: current_time - 3.hours
        )
      end

      it "elimina la tutoría pending" do
        expect {
          described_class.perform_now
        }.to change { Tutoring.exists?(pending_tutoring.id) }.from(true).to(false)
      end
    end

    context "cuando hay tutorías pending con al menos una availability no vencida" do
      let!(:pending_tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_availability) do
        TutoringAvailability.create!(
          tutoring: pending_tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour
        )
      end

      let!(:future_availability) do
        TutoringAvailability.create!(
          tutoring: pending_tutoring,
          start_time: current_time + 1.hour,
          end_time: current_time + 2.hours
        )
      end

      it "no elimina la tutoría" do
        expect {
          described_class.perform_now
        }.not_to(change { Tutoring.exists?(pending_tutoring.id) })
      end
    end

    context "cuando hay una tutoría active creada por el tutor con solo el tutor como participante" do
      let!(:active_tutoring_by_tutor) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          created_by_id: tutor.id,
          capacity: 5,
          modality: "virtual",
          state: "active"
        )
      end

      let!(:expired_availability) do
        TutoringAvailability.create!(
          tutoring: active_tutoring_by_tutor,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour
        )
      end

      let!(:tutor_user_tutoring) do
        UserTutoring.create!(
          user: tutor,
          tutoring: active_tutoring_by_tutor
        )
      end

      it "elimina la tutoría activa" do
        expect {
          described_class.perform_now
        }.to change { Tutoring.exists?(active_tutoring_by_tutor.id) }.from(true).to(false)
      end
    end

    context "cuando hay una tutoría active con múltiples participantes" do
      let!(:student) do
        User.create!(
          name: "Student",
          last_name: "Test",
          email: "student@mail.com",
          password: "password123",
          password_confirmation: "password123",
          faculty: faculty
        )
      end

      let!(:active_tutoring_with_students) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          created_by_id: tutor.id,
          capacity: 5,
          modality: "virtual",
          state: "active"
        )
      end

      let!(:expired_availability) do
        TutoringAvailability.create!(
          tutoring: active_tutoring_with_students,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour
        )
      end

      let!(:tutor_user_tutoring) do
        UserTutoring.create!(
          user: tutor,
          tutoring: active_tutoring_with_students
        )
      end

      let!(:student_user_tutoring) do
        UserTutoring.create!(
          user: student,
          tutoring: active_tutoring_with_students
        )
      end

      it "no elimina la tutoría" do
        expect {
          described_class.perform_now
        }.not_to(change { Tutoring.exists?(active_tutoring_with_students.id) })
      end
    end

    context "cuando ocurre un error al destruir una tutoría" do
      let!(:pending_tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_availability) do
        TutoringAvailability.create!(
          tutoring: pending_tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour
        )
      end

      before do
        allow(Rails.logger).to receive(:error)
        allow(Rails.logger).to receive(:info)
        allow_any_instance_of(Tutoring).to receive(:destroy).and_raise(StandardError, "Error al destruir")
      end

      it "registra el error pero continúa" do
        expect { described_class.perform_now }.not_to raise_error

        expect(Rails.logger).to have_received(:error).with(a_string_matching(/Error al destruir/))
      end
    end

    context "cuando hay múltiples tipos de tutorías a procesar" do
      let!(:finished_tutoring) do
        Tutoring.new(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          duration_mins: 60,
          scheduled_at: current_time - 2.hours,
          state: "active"
        ).tap { |t| t.save(validate: false) }
      end

      let!(:pending_expired_tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_availability) do
        TutoringAvailability.create!(
          tutoring: pending_expired_tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour
        )
      end

      let!(:active_tutoring_to_keep) do
        Tutoring.new(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          duration_mins: 120,
          scheduled_at: current_time - 30.minutes,
          state: "active"
        ).tap { |t| t.save(validate: false) }
      end

      it "procesa correctamente cada tipo de tutoría" do
        expect {
          described_class.perform_now
        }.to change { Tutoring.exists?(pending_expired_tutoring.id) }.from(true).to(false)
                                                                     .and change {
                                                                            finished_tutoring.reload.state
                                                                          }.from("active").to("finished")

        expect(active_tutoring_to_keep.reload).to be_active
      end
    end
  end
end
