module Api
  module V1
    class CoursesController < ApplicationController
      include Pagy::Backend

      def index
        courses = Course.order(:name)

        # Filtro de búsqueda por nombre
        courses = courses.where("unaccent(name) ILIKE unaccent(?)", "%#{params[:search]}%") if params[:search].present?

        @pagy, @courses = pagy(courses, items: params[:per_page] || 20)

        favorite_course_ids =
          if current_user
            page_ids = @courses.map(&:id)
            current_user.favorite_courses.where(course_id: page_ids).pluck(:course_id)
          else
            []
          end

        render json: {
          courses: @courses.map { |course|
            course.as_json(only: [:id, :name, :code, :institute]).merge(
              favorite: favorite_course_ids.include?(course.id)
            )
          },
          pagination: pagy_metadata(@pagy)
        }
      end

      # Método para obtener un curso por ID y sus temas asociados
      def show
        course = Course.includes(:subjects).find(params[:id])

        payload = course.as_json(
          include: {
            subjects: { only: [:id, :name] } # en schema subjects tiene :id, :name
          }
        )

        payload[:favorite] = current_user ? current_user.favorite_courses.exists?(course_id: course.id) : false

        render json: payload
      rescue ActiveRecord::RecordNotFound
        render json: { error: "No se encontró el curso solicitado" }, status: :not_found
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
        params.expect(course: [:name, :code, :institute, :faculty])
      end
    end
  end
end
