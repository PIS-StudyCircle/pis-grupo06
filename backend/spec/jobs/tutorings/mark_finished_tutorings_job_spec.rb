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
        3.times.map do |i|
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
  end
end
