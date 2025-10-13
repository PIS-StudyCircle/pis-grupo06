module Api
  module V1
    module Users
      class UserReviewsController < ApplicationController
        before_action :authenticate_user!

        def index
          reviewed_id = params[:reviewed_id]
          reviews = UserReview.where(reviewed_id: reviewed_id)
          render json: reviews.as_json(
            include: { reviewer: { only: [:id, :name, :last_name] } }
          )
        end

        def can_review
          reviewed_id = params[:reviewed_id].to_i
          reviewer_id = current_user.id

          # No puede reseñarse a sí mismo
          if reviewed_id == reviewer_id
            return render json: { can_review: false }
          end

          # Caso 1: estudiante reseña a su tutor
          from_student_to_tutor = Tutoring
            .joins(:user_tutorings)
            .where(user_tutorings: { user_id: reviewer_id })
            .where(tutor_id: reviewed_id)
            .exists?

          # Caso 2: tutor reseña a su estudiante
          from_tutor_to_student = Tutoring
            .joins(:user_tutorings)
            .where(tutor_id: reviewer_id, user_tutorings: { user_id: reviewed_id })
            .exists?

          # Solo puede dejar reseña si compartieron tutoría y no existe una reseña previa
          shared_tutoring = from_student_to_tutor || from_tutor_to_student
          already_reviewed = UserReview.exists?(reviewer_id: reviewer_id, reviewed_id: reviewed_id)

          render json: { can_review: shared_tutoring && !already_reviewed }
        end



        def create
          review = UserReview.new(
            reviewer: current_user,
            reviewed_id: params[:reviewed_id],
            review: params[:review]
          )

          if review.save
            render json: review, status: :created
          else
            render json: { errors: review.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
