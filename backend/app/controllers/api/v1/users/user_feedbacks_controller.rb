# app/controllers/api/v1/users/user_feedbacks_controller.rb
module Api
  module V1
    module Users
      class UserFeedbacksController < ApplicationController
        before_action :authenticate_user!

        # GET /api/v1/users/user_feedbacks
        def index
          tutor = current_user

          feedbacks = tutor.received_feedbacks
                           .includes(:student, tutoring: :course)
                           .order(created_at: :desc)

          avg = (feedbacks.average(:rating) || 0).to_f.round(2)

          render json: {
            average_rating:   avg,
            total_feedbacks:  feedbacks.size,
            feedbacks: feedbacks.as_json(
              include: {
                student: { only: [:id, :name, :last_name, :email] },
                tutoring: {
                  only: [:id],
                  include: {
                    course: { only: [:id, :name] }
                  }
                }
              },
              only: [:id, :rating, :created_at]
            )
          }, status: :ok
        end

        # POST /api/v1/users/user_feedbacks
        # Espera params: { tutoring_id:, rating: }
        def create
          tutoring = Tutoring.find_by(id: feedback_params[:tutoring_id])
          rating   = feedback_params[:rating]

          return render json: { error: "Falta tutoring_id o rating" }, status: :unprocessable_entity if tutoring.blank? || rating.blank?

          tutor_id = tutoring.tutor_id

          if tutor_id == current_user.id
            return render json: { error: "No puedes calificarte a ti mismo" }, status: :forbidden
          end

          if Feedback.exists?(student_id: current_user.id, tutoring_id: tutoring.id)
            return render json: { error: "Ya dejaste calificación para esta tutoría" }, status: :conflict
          end

          feedback = Feedback.new(
            tutor_id:    tutor_id,
            student_id:  current_user.id,
            tutoring_id: tutoring.id,
            rating:      rating
          )

          if feedback.save
            # promedio actualizado del tutor
            avg = Feedback.where(tutor_id: tutor_id).average(:rating)
            avg = (avg || 0).to_f.round(2)

            render json: {
              ok: true,
              average_rating: avg,
              feedback: feedback.as_json(
                include: {
                  student: { only: [:id, :name, :last_name, :email] },
                  tutor:   { only: [:id, :name, :last_name, :email] }
                },
                only: [:id, :rating, :created_at]
              )
            }, status: :created
          else
            render json: { ok: false, errors: feedback.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/users/user_feedbacks/:id
        def destroy
          feedback = Feedback.find_by(id: params[:id])
          return render json: { error: "Feedback no encontrado" }, status: :not_found unless feedback
          return render json: { error: "No tienes permiso para eliminar este feedback" }, status: :forbidden unless feedback.student_id == current_user.id

          if feedback.destroy
            render json: { ok: true, message: "Feedback eliminado correctamente" }, status: :ok
          else
            render json: { ok: false, errors: feedback.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def feedback_params
          params.permit(:tutoring_id, :rating)
        end
      end
    end
  end
end
