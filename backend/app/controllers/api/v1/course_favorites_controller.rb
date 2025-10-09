module Api
  module V1
    class CourseFavoritesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_course

      def create
        current_user.favorite_courses.find_or_create_by!(course: @course)
        render json: { favorite: true }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors }, status: :unprocessable_entity
      end

      def destroy
        current_user.favorite_courses.where(course: @course).delete_all
        head :no_content
      end

      private

      def set_course
        @course = Course.find(params[:course_id] || params[:id])
      end
    end
  end
end
