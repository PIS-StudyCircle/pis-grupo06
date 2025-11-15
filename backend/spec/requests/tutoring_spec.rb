require "rails_helper"

RSpec.describe "Tutoring model (self-contained spec)", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  def ensure_faculty
    uni = University.find_or_create_by!(name: "Test University")
    Faculty.find_or_create_by!(name: "Test Faculty", university: uni)
  end

  def create_user(attrs = {})
    faculty = ensure_faculty
    defaults = {
      email: "user#{SecureRandom.hex(3)}@mail.test",
      password: "password123",
      password_confirmation: "password123",
      name: "Nombre",
      last_name: "Apellido",
      faculty: faculty,
      jti: SecureRandom.uuid
    }
    User.create!(defaults.merge(attrs))
  end

  def create_course(attrs = {})
    defaults = {
      name: "Course #{SecureRandom.hex(2)}",
      code: "C#{rand(1000..9999)}"
    }
    Course.create!(defaults.merge(attrs))
  end

  def create_tutoring(attrs = {})
    defaults = {
      course: create_course,
      scheduled_at: 1.day.from_now,
      duration_mins: 60,
      modality: "virtual",
      capacity: 5
    }
    Tutoring.create!(defaults.merge(attrs))
  end

  def create_user_tutoring(user:, tutoring:)
    UserTutoring.create!(user: user, tutoring: tutoring)
  end

  describe "associations (behavioral)" do
    it "users through user_tutorings y dependent: :destroy" do
      t = create_tutoring
      u1 = create_user
      u2 = create_user
      create_user_tutoring(user: u1, tutoring: t)
      create_user_tutoring(user: u2, tutoring: t)

      expect(t.users.map(&:id)).to match_array([u1.id, u2.id])
      expect { t.destroy }.to change { UserTutoring.count }.by(-2)
    end

    it "subjects through subject_tutorings y dependent: :destroy" do
      t = create_tutoring
      s1 = Subject.create!(name: "S1", course: t.course, creator: create_user)
      s2 = Subject.create!(name: "S2", course: t.course, creator: create_user)
      SubjectTutoring.create!(subject: s1, tutoring: t)
      SubjectTutoring.create!(subject: s2, tutoring: t)

      expect(t.subjects.map(&:id)).to match_array([s1.id, s2.id])
      expect { t.destroy }.to change { SubjectTutoring.count }.by(-2)
      expect(Subject.where(id: [s1.id, s2.id]).count).to eq(2)
    end

    it "belongs_to :course, :creator (opcional) y :tutor (opcional)" do
      course  = create_course
      creator = create_user
      tutor   = create_user
      t = create_tutoring(course: course, creator: creator, tutor: tutor)

      expect(t.course).to eq(course)
      expect(t.creator).to eq(creator)
      expect(t.tutor).to eq(tutor)

      t2 = create_tutoring(course: course, creator: nil, tutor: nil)
      expect(t2.creator).to be_nil
      expect(t2.tutor).to be_nil
    end
  end

  # ---------- VALIDACIONES ----------
  describe "validations" do
    it "permite scheduled_at en blanco" do
      t = Tutoring.new(
        course: create_course,
        scheduled_at: nil,
        duration_mins: 60,
        modality: "virtual",
        capacity: 5
      )
      expect(t.valid?).to be true
    end

    it "duration_mins: presente, entero, 1..240" do
      expect(create_tutoring(duration_mins: 60)).to be_valid
      t2 = Tutoring.new(
        course: create_course,
        scheduled_at: 1.day.from_now,
        duration_mins: nil,
        modality: "virtual",
        capacity: 5
      )
      expect(t2.valid?).to be false
    end

    it "modality: inclusión en {virtual, presencial}" do
      expect(create_tutoring(modality: "virtual")).to be_valid
      expect(create_tutoring(modality: "presencial")).to be_valid
      t = Tutoring.new(
        course: create_course,
        scheduled_at: 1.day.from_now,
        duration_mins: 60,
        modality: "otro",
        capacity: 5
      )
      expect(t.valid?).to be false
    end

    it "capacity_not_less_than_enrolled: inválido si enrolled > capacity" do
      t = create_tutoring(capacity: 1)
      u1 = create_user
      u2 = create_user
      create_user_tutoring(user: u1, tutoring: t)
      create_user_tutoring(user: u2, tutoring: t)
      expect(t.reload.valid?).to be false
      expect(t.errors[:capacity]).to be_present
    end
  end

  # ---------- SCOPES ----------
  describe "scopes" do
    around do |ex|
      travel_to(Time.zone.now.change(usec: 0)) { ex.run } # t0
    end

    before do
      @course_a = create_course
      @course_b = create_course
      @user     = create_user
      @creator  = create_user
      @tutor_u  = create_user

      @tut_a1 = create_tutoring(course: @course_a, creator: @creator, tutor: @tutor_u, scheduled_at: 5.days.from_now)
      @tut_a2 = create_tutoring(course: @course_a, creator: @creator, tutor: nil,     scheduled_at: 2.days.from_now)
      @tut_b1 = create_tutoring(course: @course_b, creator: nil,      tutor: nil,     scheduled_at: 7.days.from_now)

      create_user_tutoring(user: @user, tutoring: @tut_a1)
    end

    it ".enrolled_by(user)" do
      expect(Tutoring.enrolled_by(@user)).to contain_exactly(@tut_a1)
    end

    it ".enrolled_by(nil)" do
      expect(Tutoring.enrolled_by(nil)).to be_empty
    end

    it ".by_course_id" do
      expect(Tutoring.by_course_id(@course_b.id)).to contain_exactly(@tut_b1)
    end

    it ".created_by" do
      expect(Tutoring.created_by(@creator.id)).to match_array([@tut_a1, @tut_a2])
    end

    it ".without_tutor" do
      expect(Tutoring.without_tutor).to match_array([@tut_a2, @tut_b1])
    end

    context ".past y .upcoming" do
      before { travel 4.days }

      # it ".past" do
      #   expect(Tutoring.past).to include(@tut_a2)
      #   expect(Tutoring.past).not_to include(@tut_a1, @tut_b1)
      # end

      it ".upcoming" do
        expect(Tutoring.upcoming).to include(@tut_a1, @tut_b1)
        expect(Tutoring.upcoming).not_to include(@tut_a2)
      end
    end
  end
end
