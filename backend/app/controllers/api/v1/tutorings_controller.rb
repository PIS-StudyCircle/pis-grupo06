module Api
  module V1
    class TutoringsController < ApplicationController
      include Pagy::Backend

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
        end

        q = params[:search].to_s
        search_by = params[:search_by].presence_in(%w[course subject]) || "course"

        tutorings =
          case search_by
          when "subject" then tutorings.search_by_subject_name(q)
          else tutorings.search_by_course_name(q)
          end

        # por defecto muestro las futuras
        if params[:past].present? && ActiveModel::Type::Boolean.new.cast(params[:past])
          tutorings = tutorings.past
        else
          tutorings = tutorings.upcoming
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
              tutor_name: t.tutor&.name,
              tutor_last_name: t.tutor&.last_name
            }
          end,
          pagination: pagy_metadata(@pagy)
        }
      end
    end
  end
end
