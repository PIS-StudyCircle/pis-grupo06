module Api
  module V1
    module Users
      class ListController < ApplicationController
        include Pagy::Backend

        before_action :authenticate_user!, except: [:index]

        def index
          users = User.all
          if params[:search].present?
            query = params[:search].downcase
            users = users.select do |u|
              [u[:name], u[:last_name], u[:email]].any? do |field|
                field.downcase.include?(query)
              end
            end
          end

          render json: {
            users: users,
            pagination: {
              page: 1,
              prev: nil,
              next: nil,
              last: 1,
              count: users.size,
              items: users.size
            }
          }
        end

        def show
          user = User.find(params[:id])
          render json: user.as_json(only: [:id, :name, :last_name, :email])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "No se encontró el usuario solicitado" }, status: :not_found
        end
      end
    end
  end
end
