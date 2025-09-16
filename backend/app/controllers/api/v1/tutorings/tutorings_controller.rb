module Api
  module V1
    class TutoringsController < ApplicationController
      include Pagy::Backend

      def index
        tutorings = case params[:filter]
        when 'created_by'
          current_user.tutorings           # tutorings que creó el usuario
        when 'enrolled'
          current_user.enrolled_tutorings # tutorings en las que está anotado
        when 'tutor'
          Tutoring.where(tutor_id: current_user.id) # tutorings donde es tutor
        else
          Tutoring.all
        end

        @pagy, @tutorings = pagy(tutorings, items: params[:per_page] || 20)

        render json: {
          tutorings: @tutorings,
          pagination: pagy_metadata(@pagy)
        }
      end
    end
  end
end
