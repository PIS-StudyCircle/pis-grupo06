module Api
  module V1
    class CoursesController < ApplicationController
      def index
        @courses = Course.all
        render json: @courses
      end

      #este metodo no va a estar disponible para el usuario
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
