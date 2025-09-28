module Api
  module V1
    class TutoringsController < ApplicationController
      def create
        tutoring = Tutoring.new(tutoring_params)
        if tutoring.save

        # Por el momento yo estoy enviando id de subjects, pero si aún no está creado, no tiene id
        # Hay que pasar el subject por nombre y/o id y crear el subject si no existe id
        
          if params[:tutoring][:subject_ids]
            params[:tutoring][:subject_ids].each do |subject_id|
              tutoring.subject_tutorings.create(subject_id: subject_id)
            end
          end

          # Asociar el usuario tutor
          if params[:tutoring][:user_id]
            tutoring.user_tutorings.create(user_id: params[:tutoring][:user_id])
          end

          render json: { tutoring: tutoring }, status: :created
        else
          render json: { errors: tutoring.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def tutoring_params
        params.require(:tutoring).permit(:title, :description, :scheduled_at, :duration_mins, :modality, :capacity, :user_id)
      end
    end
  end
end