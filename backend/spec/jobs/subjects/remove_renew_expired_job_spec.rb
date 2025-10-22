require 'rails_helper'

RSpec.describe Subjects::RemoveRenewExpiredJob, type: :job do
  let(:today) { Time.zone.today }
  let(:university) { University.create!(name: "UDELAR") }
  let(:faculty) { Faculty.create!(name: "Ingeniería", university: university) }
  let(:course) { Course.create!(name: "Física", faculty: faculty) }

  before do
    allow(Time.zone).to receive(:today).and_return(today)
  end

  describe "#perform" do
    context "cuando el subject tiene tutorías activas" do
      it "renueva su due_date por 3 meses" do
        subject_record = Subject.create!(
          name: "Matemática I",
          due_date: today - 1.day,
          course: course
        )

        tutor = User.create!(
          name: "Tutor",
          last_name: "Activo",
          email: "activo@mail.com",
          password: "password123",
          password_confirmation: "password123",
          faculty: faculty
        )

        tutoring = Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          duration_mins: 60,
          scheduled_at: 1.day.from_now,
          state: "active"
        )

        SubjectTutoring.create!(subject: subject_record, tutoring: tutoring)

        described_class.perform_now

        subject_record.reload
        expect(subject_record.due_date).to eq(today + 3.months)
        expect(Subject.exists?(subject_record.id)).to be true
      end
    end

    context "cuando el subject no tiene tutorías activas" do
      it "se elimina junto con sus dependencias" do
        Subject.create!(
          name: "Física I",
          due_date: today - 1.day,
          course: course
        )

        expect {
          described_class.perform_now
        }.to change(Subject, :count).by(-1)
      end
    end

    context "cuando ocurre un error en el proceso" do
      it "registra el error pero continúa" do
        Subject.create!(
          name: "Error Test",
          due_date: today - 1.day,
          course: course
        )

        allow(Rails.logger).to receive(:error)

        allow_any_instance_of(Subject).to receive(:destroy!).and_raise(StandardError, "Fallo controlado")

        expect { described_class.perform_now }.not_to raise_error

        expect(Rails.logger).to have_received(:error).with(a_string_matching(/Fallo controlado/))
      end
    end
  end
end
