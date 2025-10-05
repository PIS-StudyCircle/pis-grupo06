require "rails_helper"

RSpec.describe "Api::V1::Subjects", type: :request do
  let!(:universidad) { University.create!(name: "Universidad de Ejemplo") }
  let!(:facultad)   { Faculty.create!(name: "Facultad", university: universidad) }
  let!(:course)     {
    Course.create!(name: "Curso Especial", code: "CE1", institute: "Instituto Especial", faculty: facultad)
  }
  let!(:user) {
    User.create!(email: "test@example.com", password: "password", password_confirmation: "password", name: "Test",
                 last_name: "User", faculty: facultad)
  }

  before do
    # loguear usuario con Devise helper
    sign_in user
  end

  describe "POST /api/v1/courses/:course_id/subjects" do
    it "crea un subject con due_date a 3 meses desde ahora" do
      expect {
        post "/api/v1/courses/#{course.id}/subjects", params: {
          subject: { name: "Nuevo Tema", course_id: course.id }
        }
      }.to change(Subject, :count).by(1)

      subject = Subject.last
      expect(subject.name).to eq("Nuevo Tema")
      expect(subject.course_id).to eq(course.id)
      expect(subject.due_date.to_date).to eq(3.months.from_now.to_date)
    end
  end
end
