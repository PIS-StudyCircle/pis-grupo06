require 'rails_helper'

RSpec.describe RemoveExpiredAvailabilitiesJob, type: :job do
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
    context "cuando hay availabilities expiradas y disponibles" do
      let!(:tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_available_availability) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour,
          is_booked: false
        )
      end

      it "elimina la availability expirada y disponible" do
        expect {
          described_class.perform_now
        }.to change(TutoringAvailability, :count).by(-1)
      end
    end

    context "cuando hay availabilities expiradas pero reservadas" do
      let!(:tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_booked_availability) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour,
          is_booked: true
        )
      end

      it "no elimina la availability reservada" do
        expect {
          described_class.perform_now
        }.not_to(change(TutoringAvailability, :count))
      end
    end

    context "cuando hay availabilities disponibles pero no expiradas" do
      let!(:tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:future_available_availability) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time + 1.hour,
          end_time: current_time + 2.hours,
          is_booked: false
        )
      end

      it "no elimina la availability futura" do
        expect {
          described_class.perform_now
        }.not_to(change(TutoringAvailability, :count))
      end
    end

    context "cuando hay múltiples availabilities expiradas y disponibles" do
      let!(:tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_availabilities) do
        Array.new(3) do |i|
          TutoringAvailability.create!(
            tutoring: tutoring,
            start_time: current_time - (i + 2).hours,
            end_time: current_time - (i + 1).hours,
            is_booked: false
          )
        end
      end

      it "elimina todas las availabilities expiradas y disponibles" do
        expect {
          described_class.perform_now
        }.to change(TutoringAvailability, :count).by(-3)
      end
    end

    context "cuando hay un mix de availabilities expiradas disponibles y reservadas" do
      let!(:tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:expired_available1) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time - 3.hours,
          end_time: current_time - 2.hours,
          is_booked: false
        )
      end

      let!(:expired_booked) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour,
          is_booked: true
        )
      end

      let!(:expired_available2) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time - 1.hour,
          end_time: current_time - 30.minutes,
          is_booked: false
        )
      end

      let!(:future_available) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time + 1.hour,
          end_time: current_time + 2.hours,
          is_booked: false
        )
      end

      it "elimina solo las availabilities expiradas y disponibles" do
        expect {
          described_class.perform_now
        }.to change(TutoringAvailability, :count).by(-2)

        expect(TutoringAvailability.exists?(expired_booked.id)).to be true
        expect(TutoringAvailability.exists?(future_available.id)).to be true
        expect(TutoringAvailability.exists?(expired_available1.id)).to be false
        expect(TutoringAvailability.exists?(expired_available2.id)).to be false
      end
    end

    context "cuando no hay availabilities" do
      it "no falla" do
        expect {
          described_class.perform_now
        }.not_to raise_error
      end
    end

    context "cuando no hay availabilities que cumplan ambas condiciones" do
      let!(:tutoring) do
        Tutoring.create!(
          course: course,
          tutor: tutor,
          capacity: 5,
          modality: "virtual",
          state: "pending"
        )
      end

      let!(:booked_availability) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time - 2.hours,
          end_time: current_time - 1.hour,
          is_booked: true
        )
      end

      let!(:future_availability) do
        TutoringAvailability.create!(
          tutoring: tutoring,
          start_time: current_time + 1.hour,
          end_time: current_time + 2.hours,
          is_booked: false
        )
      end

      it "no elimina ninguna availability" do
        expect {
          described_class.perform_now
        }.not_to(change(TutoringAvailability, :count))
      end
    end
  end
end
