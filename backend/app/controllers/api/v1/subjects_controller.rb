module Api
  module V1
    class SubjectsController < ApplicationController
      include Pagy::Backend
      include JsonResponse

      before_action :authenticate_user!, only: [:create]

      def index
        subjects = Subject.order(:name)

        # Filtro de búsqueda por nombre
        subjects = subjects.where("unaccent(name) ILIKE unaccent(?)",
                                  "%#{params[:search]}%") if params[:search].present?

        # Filtro de búsqueda por id de curso
        subjects = subjects.where(course_id: params[:course_id]) if params[:course_id].present?

        @pagy, @subjects = pagy(subjects, items: params[:per_page] || 20)

        render json: {
          subjects: @subjects,
          pagination: pagy_metadata(@pagy)
        }
      end

      def show
        subject = Subject.find(params[:id])

        active_tutorings = subject.tutorings
                                  .upcoming
                                  .order(:scheduled_at)

        data = {
          id: subject.id,
          name: subject.name,
          course_id: subject.course_id,
          tutorings: active_tutorings.map do |t|
            {
              id: t.id,
              scheduled_at: t.scheduled_at,
              duration_mins: t.duration_mins,
              modality: t.modality,
              capacity: t.capacity,
              enrolled: t.enrolled,
              seats_left: t.capacity - t.enrolled,
              tutor_id: t.tutor_id
            }
          end
        }

        success_response(message: "Tema y tutorias cargadas con exito", data: data)
      rescue ActiveRecord::RecordNotFound
        error_response(message: "Tema no encontrado", status: :not_found)
      end

      def create
        subject = Subject.new(subject_params)
        subject.creator = current_user

        if subject.save
          render json: subject, status: :created
        else
          render json: subject.errors, status: :unprocessable_entity
        end
      end

      private

      def subject_params
        params.expect(subject: [:name, :course_id])
      end
    end
  end
end
