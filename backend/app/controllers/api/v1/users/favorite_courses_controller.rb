module Api
  module V1
    module Users
      class FavoriteCoursesController < ApplicationController
        before_action :authenticate_user!

        def index
          courses = current_user.favorite_courses_list.order(:name)
          render json: courses, status: :ok
        end
      end
    end
  end
end
