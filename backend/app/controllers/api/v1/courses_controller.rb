module Api
  module V1
    class CoursesController < ApplicationController
      def index
        @courses = Course.all
        render json: @courses
      end

      #Este metodo lo cree para probar el listado mientras no esta el seed. No sera necesario luego
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
          params.require(:course).permit(:name)
        end
      #---
    end
  end
end
