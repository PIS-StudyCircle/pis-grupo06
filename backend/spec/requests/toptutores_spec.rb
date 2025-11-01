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
    tA = User.create!(email: "ta@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "A", last_name: "L", faculty: faculty)
    tB = User.create!(email: "tb@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "B", last_name: "L", faculty: faculty)

    s1 = User.create!(email: "s1@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "S1", last_name: "X", faculty: faculty)
    s2 = User.create!(email: "s2@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "S2", last_name: "X", faculty: faculty)

    tutA1 = build_tutoring_for(tA)
    tutA2 = build_tutoring_for(tA)
    Feedback.create!(tutor_id: tA.id, student_id: s1.id, tutoring_id: tutA1.id, rating: 5.0)
    Feedback.create!(tutor_id: tA.id, student_id: s2.id, tutoring_id: tutA2.id, rating: 4.5)

    tutB1 = build_tutoring_for(tB)
    tutB2 = build_tutoring_for(tB)
    Feedback.create!(tutor_id: tB.id, student_id: s1.id, tutoring_id: tutB1.id, rating: 4.5)
    Feedback.create!(tutor_id: tB.id, student_id: s2.id, tutoring_id: tutB2.id, rating: 4.0)

    get "/api/v1/users/user_feedbacks/top_rated"
    expect(response).to have_http_status(:ok)
    expect(json).to be_an(Array)

    itemA = json.find { |h| h["id"] == tA.id }
    itemB = json.find { |h| h["id"] == tB.id }

    expect(itemA).to include("id" => tA.id, "name" => "A", "email" => "ta@ex.com")
    expect(itemA["average_rating"]).to eq(4.8)
    expect(itemA["total_feedbacks"]).to eq(2)

    expect(itemB["average_rating"]).to eq(4.3)
    expect(itemB["total_feedbacks"]).to eq(2)
  end

  it "ordena por promedio DESC y, en empate, por total_feedbacks DESC" do
    t1 = User.create!(email: "t1@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "T1", last_name: "L", faculty: faculty)
    t2 = User.create!(email: "t2@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "T2", last_name: "L", faculty: faculty)

    s1 = User.create!(email: "sx1@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "SX1", last_name: "L", faculty: faculty)
    s2 = User.create!(email: "sx2@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "SX2", last_name: "L", faculty: faculty)
    s3 = User.create!(email: "sx3@ex.com", password: "12345678", password_confirmation: "12345678",
                      name: "SX3", last_name: "L", faculty: faculty)

    [5.0, 4.5, 5.0].each_with_index do |r, i|
      tut = build_tutoring_for(t1)
      stu = [s1, s2, s3][i]
      Feedback.create!(tutor_id: t1.id, student_id: stu.id, tutoring_id: tut.id, rating: r)
    end

    [5.0, 4.5].each_with_index do |r, i|
      tut = build_tutoring_for(t2)
      stu = [s1, s2][i]
      Feedback.create!(tutor_id: t2.id, student_id: stu.id, tutoring_id: tut.id, rating: r)
    end

    get "/api/v1/users/user_feedbacks/top_rated"
    expect(response).to have_http_status(:ok)

    ids_en_orden = json.map { |h| h["id"] }
    expect(ids_en_orden.index(t1.id)).to be < ids_en_orden.index(t2.id)

    h1 = json.find { |h| h["id"] == t1.id }
    h2 = json.find { |h| h["id"] == t2.id }
    expect(h1["average_rating"]).to eq(4.8)
    expect(h2["average_rating"]).to eq(4.8)
    expect(h1["total_feedbacks"]).to be > h2["total_feedbacks"]
  end

  it "limita a 5 resultados" do
    students = 6.times.map do |i|
      User.create!(email: "st#{i}@ex.com", password: "12345678", password_confirmation: "12345678",
                   name: "ST#{i}", last_name: "L", faculty: faculty)
    end

    tutors = 6.times.map do |i|
      User.create!(email: "tt#{i}@ex.com", password: "12345678", password_confirmation: "12345678",
                   name: "TT#{i}", last_name: "L", faculty: faculty)
    end

    tutors.each_with_index do |t, i|
      tut = build_tutoring_for(t)
      Feedback.create!(
        tutor_id: t.id,
        student_id: students[i % students.size].id,
        tutoring_id: tut.id,
        rating: 3.0 + (i % 3) * 1.0
      )
    end

    get "/api/v1/users/user_feedbacks/top_rated"
    expect(response).to have_http_status(:ok)
    expect(json.size).to eq(5)
  end
end
