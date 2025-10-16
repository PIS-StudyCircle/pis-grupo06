require 'rails_helper'

RSpec.describe UserReview, type: :model do
  let!(:university) { University.create!(name: "Universidad de la República") }
  let!(:faculty)    { Faculty.create!(name: "Facultad de Ingeniería", university: university) }
  let!(:reviewer) { User.create!(name: "Alice", last_name: "Tutor", email: "alice@test.com", password: "12345678", password_confirmation: "12345678", faculty: faculty) }
  let!(:reviewed) { User.create!(name: "Bob", last_name: "Student", email: "bob@test.com", password: "12345678", password_confirmation: "12345678", faculty: faculty) }

  before do
    # Simulamos que hay tutoría compartida
    allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(true)
  end

  it "es válido con datos correctos" do
    review = UserReview.new(reviewer: reviewer, reviewed: reviewed, review: "Muy bueno")
    expect(review).to be_valid
  end

  it "no permite reseñarse a sí mismo" do
    review = UserReview.new(reviewer: reviewer, reviewed: reviewer, review: "Me voy a reseñara mi mismo")
    expect(review).not_to be_valid
    expect(review.errors[:base]).not_to be_empty
  end

  it "no permite reseñar si no hay tutoría compartida" do
    allow(Tutoring).to receive_message_chain(:shared_between, :exists?).and_return(false)
    review = UserReview.new(reviewer: reviewer, reviewed: reviewed, review: "No hay tutoría")
    expect(review).not_to be_valid
    expect(review.errors[:base]).to include("Solo se pueden dejar reseñas entre usuarios que compartieron tutoría")
  end

  it "no permite reseñar dos veces al mismo usuario" do
    UserReview.create!(reviewer: reviewer, reviewed: reviewed, review: "Primera reseña")
    duplicate_review = UserReview.new(reviewer: reviewer, reviewed: reviewed, review: "Segunda reseña")
    expect(duplicate_review).not_to be_valid
    expect(duplicate_review.errors[:reviewer_id]).to include("ya está en uso") 
  end
end
