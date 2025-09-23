module Api
  module V1
    class SubjectsController < ApplicationController
      include Pagy::Backend

      def index
        subjects = Subject.order(:name)
        # Filtro por course_id
        subjects = subjects.where(course_id: params[:course_id]) if params[:course_id].present?
        # Filtro de búsqueda por nombre
        subjects = subjects.where("unaccent(name) ILIKE unaccent(?)", "%#{params[:search]}%") if params[:search].present?

        @pagy, @subjects = pagy(subjects, items: params[:per_page] || 10)

        render json: {
          subjects: @subjects.as_json(only: [:id, :name, :course_id]),
          pagination: pagy_metadata(@pagy)
        }
      end
    end
  end
end