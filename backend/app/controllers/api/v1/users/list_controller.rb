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
          user = sample_users.find { |u| u[:id] == params[:id].to_i }
          if user
            render json: user
          else
            render json: { error: "No se encontró el usuario solicitado" }, status: :not_found
          end
        end

        def sample_users
          [
            { id: 1, name: "Juan", last_name: "Pérez", email: "juan.perez@example.com", photo: "https://i.pravatar.cc/150?img=5" },
            { id: 2, name: "María", last_name: "Gómez", email: "maria.gomez@example.com", photo: "https://i.pravatar.cc/150?img=6" },
            { id: 3, name: "Carlos", last_name: "Fernández", email: "carlos.fernandez@example.com", photo: "https://i.pravatar.cc/150?img=7" },
            { id: 4, name: "Lucía", last_name: "Martínez", email: "lucia.martinez@example.com", photo: "https://i.pravatar.cc/150?img=8" },
            { id: 5, name: "Andrés", last_name: "Rodríguez", email: "andres.rodriguez@example.com", photo: "https://i.pravatar.cc/150?img=9" },
            { id: 6, name: "Sofía", last_name: "López", email: "sofia.lopez@example.com", photo: "https://i.pravatar.cc/150?img=10" },
            { id: 7, name: "Martín", last_name: "García", email: "martin.garcia@example.com", photo: "https://i.pravatar.cc/150?img=11" }
          ]
        end

      end
    end
  end
end
