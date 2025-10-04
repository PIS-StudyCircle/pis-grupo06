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
            users: @users,
            pagination: pagy_metadata(@pagy)
          }
        end

        def show
          user = User.find_by(id: params[:id])
          if user
            render json: user
          else
            render json: { error: "No se encontró el usuario solicitado" }, status: :not_found
          end
        end
      end
    end
  end
end
