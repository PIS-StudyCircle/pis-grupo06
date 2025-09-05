module Api
  module V1
    class CoursesController < ApplicationController
      def index
        #@courses = Course.all
        #render json: @courses

        cursos_fake = [
          {
            nombre: "Actividad Integradora A",
            codigo: "1862",
            instituto: "INCO"
          },
          {
            nombre: "Actividad Integradora B",
            codigo: "1863",
            instituto: "INCO"
          },
          {
            nombre: "Administración de Infraestructuras",
            codigo: nil,
            instituto: ""
          },
          {
            nombre: "Administración de Infraestructuras 2",
            codigo: nil,
            instituto: ""
          }
        ]
        render json: cursos_fake
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
        params.require(:course).permit(:name, :faculty)
      end
    end
  end
end
