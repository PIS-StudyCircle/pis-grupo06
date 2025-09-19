module Api
  module V1
    class TutoringsController < ApplicationController
      include Pagy::Backend

      def index
        tutorings = Tutoring.all

        tutorings = tutorings.includes(:course, :subjects)

        #tutorias en las que el usuario esta inscripto
        if params[:enrolled].present? && ActiveModel::Type::Boolean.new.cast(params[:enrolled])
          tutorings = tutorings.enrolled_by(current_user)
        end

        #tutorias de una materia especifica (por codigo de curso)
        if params[:course_cod].present?
          tutorings = tutorings.with_course_code(params[:course_cod])
        end

        #tutorias de una materia especifica (porid de curso)
        if params[:course_id].present?
          tutorings = tutorings.by_course_id(params[:course_id])
        end
        
        #tutorias creadas por el usuario indicado (no current_user, esto por si se quiere ampliar a ver tutorias creadas por otros usuarios)
        if params[:created_by_user].present?
          tutorings = tutorings.created_by(params[:created_by_user])
        end

        #los que aun no tienen tutor asignado
        if params[:no_tutor].present? && ActiveModel::Type::Boolean.new.cast(params[:no_tutor])
          tutorings = tutorings.without_tutor
        end

        #por defecto muestro las futuras
        if params[:past].present? && ActiveModel::Type::Boolean.new.cast(params[:past])
          tutorings = tutorings.past
        else 
          tutorings = tutorings.upcoming
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
              tutor_id: t.tutor_id
            }
          end,
          pagination: pagy_metadata(@pagy)
        }
      end      
    end
  end
end
