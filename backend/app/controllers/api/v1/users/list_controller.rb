module Api
  module V1
    module Users
      class ListController < ApplicationController
        include Pagy::Backend

        before_action :authenticate_user!, except: [:index]

        def index
          users = User.all

          users = users.where("unaccent(name) ILIKE unaccent(?)", "%#{params[:search]}%") if params[:search].present?

          # users = users.where(role: params[:role]) if params[:role].present?

          @pagy, @users = pagy(users, items: params[:per_page] || 20)

          render json: {
            users: @users,
            pagination: pagy_metadata(@pagy)
          }
        end

        def show
          user = User.all.find { |u| u[:id] == params[:id].to_i }
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
