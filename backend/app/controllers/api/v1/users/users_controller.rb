module Api
  module V1
    module Users
      class UsersController < ApplicationController
        include Pagy::Backend

        before_action :authenticate_user!, except: [:index]

        def index
          if params[:role].present?
            if params[:role] == "tutor"
              users = User.tutors
            end
          else
            users = User.all
          end

          if params[:search].present?
            search = params[:search].strip.squeeze(" ")
            users = users.where(
              "unaccent(name || ' ' || last_name) ILIKE unaccent(?)",
              "%#{search}%"
            )
          end

          @pagy, @users = pagy(users, items: params[:per_page] || 20)

          render json: {
            users: UserSerializer
              .new(@users, params: { current_user: current_user })
              .serializable_hash[:data].pluck(:attributes),
            pagination: pagy_metadata(@pagy)
          }
        end

        def show
          user = User.find_by(id: params[:id])
          if user
            render json: UserSerializer
              .new(user, params: { current_user: current_user })
              .serializable_hash[:data][:attributes]
          else
            render json: { error: "No se encontró el usuario solicitado" }, status: :not_found
          end
        end

        def update
          if current_user.update(user_params)
            if params[:user][:profile_photo].present?
              current_user.profile_photo.attach(params[:user][:profile_photo])
            end
            success_response(
              message: "Perfil actualizado exitosamente",
              data: { user: UserSerializer.new(current_user).serializable_hash[:data][:attributes] }
            )
          else
            error_response(
              message: "No se pudo actualizar el perfil",
              errors: current_user.errors.as_json(full_messages: true),
              status: :unprocessable_entity
            )
          end
        end

        private

        def user_params
          params.expect(user: [:name, :last_name, :description])
        end
      end
    end
  end
end
