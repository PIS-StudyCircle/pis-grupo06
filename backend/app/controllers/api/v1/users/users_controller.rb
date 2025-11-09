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

        def update_profile_photo
          if params[:profile_photo].present?
            current_user.profile_photo.attach(params[:profile_photo])
            if current_user.save
              render json: UserSerializer.new(current_user).serializable_hash[:data][:attributes], status: :ok
            else
              render json: { error: "No se pudo guardar la foto" }, status: :unprocessable_entity
            end
          else
            render json: { error: "No se envió ninguna imagen" }, status: :bad_request
          end
        end
      end
      
    end
  end
end
