module Api
  module V1
    module Users
      class TutorReviewsController < ApplicationController
        before_action :authenticate_user!

        def index
            tutor = User.find(params[:tutor_id])
            reviews = TutorReview.where(tutor_id: tutor.id)
            render json: reviews
        end

        def create
            review = TutorReview.new(review_params)
            review.student = current_user

            if review.save
            render json: review, status: :created
            else
            render json: { errors: review.errors.full_messages }, status: :unprocessable_entity
            end
        end

        # GET /api/v1/tutor_reviews/can_review?tutor_id=1
        def can_review
            tutor_id = params[:tutor_id]
            student_id = current_user.id

            # no puede reseñarse a sí mismo
            if student_id == tutor_id.to_i
                return render json: { can_review: false }
            end

            # verificar si participó en una tutoría con ese tutor
            participated = Tutoring
                            .joins(:user_tutorings)
                            .where(tutor_id: tutor_id, user_tutorings: { user_id: student_id })
                            .exists?

            # verificar si ya dejó reseña antes
            already_reviewed = TutorReview.exists?(tutor_id: tutor_id, student_id: student_id)

            can_review = participated && !already_reviewed

            render json: { can_review: can_review }
        end

        private

        def review_params
            params.require(:tutor_review).permit(:tutor_id, :review)
        end
      end
    end
  end
end