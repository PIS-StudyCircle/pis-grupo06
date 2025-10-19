module Api
  module V1
    module Users
      class UserFeedbacksController < ApplicationController
        before_action :authenticate_user!

        # GET /api/v1/users/user_feedbacks?tutor_id=11
        def index
          feedbacks = if params[:tutor_id].present?
                        Feedback.where(tutor_id: params[:tutor_id])
                      else
                        Feedback.all
                      end

          render json: feedbacks.as_json(
            include: {
              student: { only: [:id, :name, :last_name, :email] }
            },
            only: [:id, :comment, :created_at]
          ), status: :ok
        end

        # POST /api/v1/users/user_feedbacks
        def create
          tutor_id = params[:tutor_id]
          comment = params[:comment]

          return render json: { error: "Falta tutor_id o comment" }, status: :unprocessable_entity if tutor_id.blank? || comment.blank?

          # Evitar que un usuario se deje feedback a sí mismo
          if tutor_id.to_i == current_user.id
            return render json: { error: "No puedes dejarte feedback a ti mismo" }, status: :forbidden
          end

          # Evitar feedbacks duplicados
          existing = Feedback.find_by(student_id: current_user.id, tutor_id: tutor_id)
          if existing
            return render json: { error: "Ya dejaste feedback para este tutor" }, status: :conflict
          end

          feedback = Feedback.new(
            tutor_id: tutor_id,
            student_id: current_user.id,
            comment: comment
          )

          if feedback.save
            render json: {
              ok: true,
              feedback: feedback.as_json(
                include: { student: { only: [:id, :name, :last_name, :email] } },
                only: [:id, :comment, :created_at]
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
      end
    end
  end
end
