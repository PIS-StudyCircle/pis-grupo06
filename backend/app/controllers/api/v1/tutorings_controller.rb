module Api
  module V1
    class TutoringsController < ApplicationController
      include Pagy::Backend

      before_action :authenticate_user!

      def index
        tutorings = Tutoring.all

        # tutorias en las que el usuario esta inscripto
        if params[:enrolled].present? && ActiveModel::Type::Boolean.new.cast(params[:enrolled])
          tutorings = tutorings.enrolled_by(current_user)
        end

        # tutorias de una materia especifica (porid de curso)
        if params[:course_id].present?
          tutorings = tutorings.by_course_id(params[:course_id])
        end

        # tutorias de una materia especifica (por id de subject)
        if params[:subject_id].present?
          tutorings = tutorings.joins(:subjects).where(subjects: { id: params[:subject_id] })
        end

        # tutorias creadas por el usuario indicado (no current_user,
        # esto por si se quiere ampliar a ver tutorias creadas por otros usuarios)
        if params[:created_by_user].present?
          tutorings = tutorings.created_by(params[:created_by_user])
        end

        # los que aun no tienen tutor asignado
        if params[:no_tutor].present? && ActiveModel::Type::Boolean.new.cast(params[:no_tutor])
          tutorings = tutorings.without_tutor

          # no aparecen las tutorias creadas por el usuario
          tutorings = tutorings.where.not(created_by_id: current_user.id)
        end

        # los que ya tienen tutor asignado y no estan pending
        if params[:with_tutor].present? && ActiveModel::Type::Boolean.new.cast(params[:with_tutor])
          tutorings = tutorings.with_tutor.where.not(state: "pending")

          # no aparecen las tutorias creadas por el usuario ni las que el usuario es tutor
          tutorings = tutorings
                      .where.not(created_by_id: current_user.id)
                      .where.not(tutor_id:      current_user.id)
        end

        q = params[:search].to_s
        search_by = params[:search_by].presence_in(%w[course subject]) || "course"

        tutorings =
          case search_by
          when "subject" then tutorings.search_by_subject_name(q)
          else tutorings.search_by_course_name(q)
          end

        # por defecto muestro las futuras o las que no tienen fecha asignada (así el tutor puede verlas y asignarse)
        if params[:past].present? && ActiveModel::Type::Boolean.new.cast(params[:past])
          tutorings = tutorings.past
        else
          tutorings = tutorings.where(
            'scheduled_at IS NULL OR scheduled_at > ?',
            Time.current
          )
        end

        @pagy, @tutorings = pagy(tutorings, items: params[:per_page] || 20)

        tutoring_ids = @tutorings.pluck(:id)
        @tutorings_with_includes = Tutoring.where(id: tutoring_ids)
                                           .includes(:course, :subjects)
                                           .order(:id)

        render json: {
          tutorings: @tutorings_with_includes.map do |t|
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
              enrolled_students: t.users.map do |user|
                {
                  id: user.id,
                }
              end,
              created_by_id: t.created_by_id,
              tutor_id: t.tutor_id,
              state: t.state,
              request_comment: t.request_comment,
              request_due_at: t.request_due_at,
              tutor_name: t.tutor&.name,
              tutor_last_name: t.tutor&.last_name
            }
          end,
          pagination: pagy_metadata(@pagy)
        }
      end

      def create
        tutoring = Tutoring.new(tutoring_params)

        tutoring.created_by_id = params.dig(:tutoring, :created_by_id)
        tutoring.tutor_id      = params.dig(:tutoring, :tutor_id)
        tutoring.course_id     = params.dig(:tutoring, :course_id)

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
              errors: ["Ya tienes una tutoría programada en esa fecha y horario"]
            }, status: :unprocessable_entity
            return
          end
        end

        if tutoring.save
          # create_user_tutoring(tutoring)
          render json: { tutoring: tutoring }, status: :created
        else
          render json: { errors: tutoring.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def create_user_tutoring(tutoring)
        return unless params.dig(:tutoring, :tutor_id).nil?

        UserTutoring.create!(user: current_user, tutoring:)
      end

      def tutoring_params
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
            :location,
            { subject_ids: [] }
          ]
        )
      end
    end
  end
end
