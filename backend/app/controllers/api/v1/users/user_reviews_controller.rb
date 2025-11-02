module Api
  module V1
    module Users
      class UserReviewsController < ApplicationController
        before_action :authenticate_user!

        def index
          reviewed_id = params[:reviewed_id]
          reviews = UserReview.where(reviewed_id: reviewed_id)
          render json: reviews.as_json(
            include: { reviewer: { only: [:id, :name, :last_name], methods: [:email_masked] } }
          )
        end

        def can_review
          reviewed_id = params[:reviewed_id].to_i
          reviewer_id = current_user.id

          # No puede reseñarse a sí mismo
          if reviewed_id == reviewer_id
            return render json: { can_review: false }
          end

          shared_tutoring = Tutoring.shared_between(reviewer_id, reviewed_id).exists?

          # Solo puede dejar reseña si no existe una reseña previa
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

        # PATCH/PUT /api/v1/user_reviews/:id
        def update
          review = current_user.given_reviews.find_by(id: params[:id])
          return render json: { error: "Reseña no encontrada o sin permisos" }, status: :not_found unless review

          if review.update(review: params[:review])
            render json: review, status: :ok
          else
            render json: { errors: review.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/user_reviews/:id
        def destroy
          @review = UserReview.find_by(id: params[:id])

          unless @review
            return render json: { error: "Reseña no encontrada" }, status: :not_found
          end

          unless @review.reviewer_id == current_user.id
            return render json: { error: "No tienes permiso para eliminar esta reseña" }, status: :forbidden
          end

          if @review.destroy
            render json: { message: "Reseña eliminada correctamente" }, status: :ok
          else
            render json: { errors: @review.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_review
          @review = UserReview.find_by(id: params[:id])
          unless @review
            render json: { error: "Reseña no encontrada" }, status: :not_found
          end
        end
      end
    end
  end
end
