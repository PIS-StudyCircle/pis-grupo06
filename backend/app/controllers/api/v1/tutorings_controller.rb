module Api
  module V1
    class TutoringsController < ApplicationController
      include Pagy::Backend

      def index
        tutorings = Tutoring.all

        tutorings = tutorings.includes(:course, :subjects)

        # tutorias en las que el usuario esta inscripto
        if params[:enrolled].present? && ActiveModel::Type::Boolean.new.cast(params[:enrolled])
          tutorings = tutorings.enrolled_by(current_user)
        end

        # tutorias de una materia especifica (porid de curso)
        if params[:course_id].present?
          tutorings = tutorings.by_course_id(params[:course_id])
        end

        # tutorias creadas por el usuario indicado (no current_user,
        # esto por si se quiere ampliar a ver tutorias creadas por otros usuarios)
        if params[:created_by_user].present?
          tutorings = tutorings.created_by(params[:created_by_user])
        end

        # los que aun no tienen tutor asignado
        if params[:no_tutor].present? && ActiveModel::Type::Boolean.new.cast(params[:no_tutor])
          tutorings = tutorings.without_tutor
        end

        # por defecto muestro las futuras
        if params[:past].present? && ActiveModel::Type::Boolean.new.cast(params[:past])
          tutorings = tutorings.past
        else
          tutorings = tutorings.where(
           '(scheduled_at > ? AND scheduled_at IS NOT NULL) OR (scheduled_at IS NULL AND tutor_id IS NULL)',
           Time.current
        )
        end

        @pagy, @tutorings = pagy(tutorings, items: params[:per_page] || 20)

        render json: {
          tutorings: @tutorings.map do |t|
            {
              id: t.id,
              scheduled_at: t.scheduled_at,
              duration_mins: t.duration_mins,
              modality: t.modality,
              capacity: t.capacity,
              enrolled: t.enrolled,
              course: {
                id: t.course.id,
                name: t.course.name,
                code: t.course.code
              },
              subjects: t.subjects.map { |s| { id: s.id, name: s.name } },
              created_by_id: t.created_by_id,
              tutor_id: t.tutor_id,
              state: t.state,
              request_comment: t.request_comment,
              request_due_at: t.request_due_at
            }
          end,
          pagination: pagy_metadata(@pagy)
        }
      end

      def create
        tutoring = Tutoring.new(tutoring_params)
        tutoring.created_by_id = params[:tutoring][:created_by_id]
        tutoring.tutor_id      = params[:tutoring][:tutor_id]
        tutoring.course_id     = params[:tutoring][:course_id]

        if tutoring.tutor_id.nil? && tutoring.capacity.nil?
          tutoring.capacity = 1 # Valor por defecto para solicitudes pendientes
        end
        if tutoring.tutor_id.present? && tutoring.scheduled_at.present? && tutoring.duration_mins.present?
          start_time = tutoring.scheduled_at
          end_time = start_time + tutoring.duration_mins.minutes

          overlapping = Tutoring.where(tutor_id: tutoring.tutor_id)
                                .where.not(id: tutoring.id)
                                .exists?([
                                  "scheduled_at < ? AND (scheduled_at + INTERVAL '1 minute' * duration_mins) > ?",
                                  end_time, start_time
                                ])

          if overlapping
            render json: {
              errors: ["Ya existe una tutoría suya que comprende ese intervalo"]
            }, status: :unprocessable_entity
            return
          end
        end

        if tutoring.save
          render json: { tutoring: tutoring }, status: :created
        else
          render json: { errors: tutoring.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def tutoring_params
        # Strong params clásicos con todos los campos que envía el front
        params.expect(
          tutoring: [
            :scheduled_at,
            :duration_mins,
            :modality,
            :capacity,
            :enrolled,
            :course_id,
            :tutor_id,
            :created_by_id,
            :request_due_at,
            :request_comment,
            { subject_ids: [] }
          ]
        )
      end
    end
  end
end
