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
        course = Course.find(params[:course_id])
        subject = course.subjects.find(params[:id])

        # subject = Subject.find(params[:id])

        data = {
          id: subject.id,
          name: subject.name,
          due_date: subject.due_date
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
