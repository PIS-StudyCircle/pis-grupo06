require "rails_helper"

RSpec.describe "GET /api/v1/users/user_feedbacks/top_rated", type: :request do
  include Devise::Test::IntegrationHelpers

  def json
    response.parsed_body
  end

  let!(:university) { University.create!(name: "Universidad Demo") }
  let!(:faculty)    { Faculty.create!(name: "Facultad Demo", university: university) }
  let!(:course)     { Course.create!(name: "Curso Demo") }

  def build_tutoring_for(tutor_user)
    Tutoring.create!(
      scheduled_at: 1.day.from_now,
      duration_mins: 60,
      modality: "presencial",
      capacity: 2,
      enrolled: 0,
      course: course,
      created_by_id: tutor_user.id,
      tutor_id: tutor_user.id
    )
  end

  it "devuelve 200 sin requerir autenticación" do
    get "/api/v1/users/user_feedbacks/top_rated"
    expect(response).to have_http_status(:ok)
    expect(json).to be_an(Array)
  end

  it "retorna campos esperados y average_rating redondeado a 1 decimal" do
    tutor_a = User.create!(email: "ta@ex.com", password: "12345678", password_confirmation: "12345678",
                           name: "A", last_name: "L", faculty: faculty)
    tutor_b = User.create!(email: "tb@ex.com", password: "12345678", password_confirmation: "12345678",
                           name: "B", last_name: "L", faculty: faculty)

    student1 = User.create!(email: "s1@ex.com", password: "12345678", password_confirmation: "12345678",
                            name: "S1", last_name: "X", faculty: faculty)
    student2 = User.create!(email: "s2@ex.com", password: "12345678", password_confirmation: "12345678",
                            name: "S2", last_name: "X", faculty: faculty)

    tutoring_a1 = build_tutoring_for(tutor_a)
    tutoring_a2 = build_tutoring_for(tutor_a)
    Feedback.create!(tutor_id: tutor_a.id, student_id: student1.id, tutoring_id: tutoring_a1.id, rating: 5.0)
    Feedback.create!(tutor_id: tutor_a.id, student_id: student2.id, tutoring_id: tutoring_a2.id, rating: 4.5)

    tutoring_b1 = build_tutoring_for(tutor_b)
    tutoring_b2 = build_tutoring_for(tutor_b)
    Feedback.create!(tutor_id: tutor_b.id, student_id: student1.id, tutoring_id: tutoring_b1.id, rating: 4.5)
    Feedback.create!(tutor_id: tutor_b.id, student_id: student2.id, tutoring_id: tutoring_b2.id, rating: 4.0)

    get "/api/v1/users/user_feedbacks/top_rated"
    expect(response).to have_http_status(:ok)
    expect(json).to be_an(Array)

    item_a = json.find { |h| h["id"] == tutor_a.id }
    item_b = json.find { |h| h["id"] == tutor_b.id }

    expect(item_a).to include("id" => tutor_a.id, "name" => "A", "email" => "ta@ex.com")
    expect(item_a["average_rating"]).to eq(4.8)
    expect(item_a["total_feedbacks"]).to eq(2)

    expect(item_b["average_rating"]).to eq(4.3)
    expect(item_b["total_feedbacks"]).to eq(2)
  end

  it "ordena por promedio DESC y, en empate, por total_feedbacks DESC" do
    tutor1 = User.create!(email: "t1@ex.com", password: "12345678", password_confirmation: "12345678",
                          name: "T1", last_name: "L", faculty: faculty)
    tutor2 = User.create!(email: "t2@ex.com", password: "12345678", password_confirmation: "12345678",
                          name: "T2", last_name: "L", faculty: faculty)

    studentx1 = User.create!(email: "sx1@ex.com", password: "12345678", password_confirmation: "12345678",
                             name: "SX1", last_name: "L", faculty: faculty)
    studentx2 = User.create!(email: "sx2@ex.com", password: "12345678", password_confirmation: "12345678",
                             name: "SX2", last_name: "L", faculty: faculty)
    studentx3 = User.create!(email: "sx3@ex.com", password: "12345678", password_confirmation: "12345678",
                             name: "SX3", last_name: "L", faculty: faculty)

    [5.0, 4.5, 5.0].each_with_index do |rating, i|
      tutoring = build_tutoring_for(tutor1)
      student  = [studentx1, studentx2, studentx3][i]
      Feedback.create!(tutor_id: tutor1.id, student_id: student.id, tutoring_id: tutoring.id, rating: rating)
    end

    [5.0, 4.5].each_with_index do |rating, i|
      tutoring = build_tutoring_for(tutor2)
      student  = [studentx1, studentx2][i]
      Feedback.create!(tutor_id: tutor2.id, student_id: student.id, tutoring_id: tutoring.id, rating: rating)
    end

    get "/api/v1/users/user_feedbacks/top_rated"
    expect(response).to have_http_status(:ok)

    ids_in_order = json.pluck("id")
    expect(ids_in_order.index(tutor1.id)).to be < ids_in_order.index(tutor2.id)

    hash1 = json.find { |h| h["id"] == tutor1.id }
    hash2 = json.find { |h| h["id"] == tutor2.id }
    expect(hash1["average_rating"]).to eq(4.8)
    expect(hash2["average_rating"]).to eq(4.8)
    expect(hash1["total_feedbacks"]).to be > hash2["total_feedbacks"]
  end

  it "limita a 5 resultados" do
    students = Array.new(6) do |i|
      User.create!(email: "st#{i}@ex.com", password: "12345678", password_confirmation: "12345678",
                   name: "ST#{i}", last_name: "L", faculty: faculty)
    end

    tutors = Array.new(6) do |i|
      User.create!(email: "tt#{i}@ex.com", password: "12345678", password_confirmation: "12345678",
                   name: "TT#{i}", last_name: "L", faculty: faculty)
    end

    tutors.each_with_index do |tutor, i|
      tutoring = build_tutoring_for(tutor)
      rating_value = (3.0 + ((i % 3) * 1.0))
      Feedback.create!(
        tutor_id: tutor.id,
        student_id: students[i % students.size].id,
        tutoring_id: tutoring.id,
        rating: rating_value
      )
    end

    get "/api/v1/users/user_feedbacks/top_rated"
    expect(response).to have_http_status(:ok)
    expect(json.size).to eq(5)
  end
end
