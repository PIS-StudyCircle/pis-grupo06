module Api
  module V1
    class CoursesController < ApplicationController
      include Pagy::Backend

      def index
        courses = Course.order(:name)

        # Filtro de búsqueda por nombre
        courses = courses.where("unaccent(name) ILIKE unaccent(?)", "%#{params[:search]}%") if params[:search].present?

        @pagy, @courses = pagy(courses, items: params[:per_page] || 20)

        render json: {
          courses: @courses,
          pagination: pagy_metadata(@pagy)
        }
      end

      # este metodo no va a estar disponible para el usuario
      def create
        @course = Course.new(course_params)
        if @course.save
          render json: @course, status: :created
        else
          render json: @course.errors, status: :unprocessable_entity
        end
      end

      private

      def course_params
        params.require(:course).permit(:name, :code, :institute, :faculty)
      end
    end
  end
end
