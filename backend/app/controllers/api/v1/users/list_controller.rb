module Api
  module V1
    module Users
      class ListController < ApplicationController
        include Pagy::Backend
        before_action :authenticate_user!, except: [:index]

        def index
          users = [
            { id: 1, name: "Juan", last_name: "Pérez", email: "juan.perez@example.com", photo: "https://miapp.com/uploads/juan.jpg" },
            { id: 2, name: "María", last_name: "Gómez", email: "maria.gomez@example.com", photo: "https://miapp.com/uploads/maria.jpg" },
            { id: 3, name: "Carlos", last_name: "Fernández", email: "carlos.fernandez@example.com", photo: "https://miapp.com/uploads/carlos.jpg" },
            { id: 4, name: "Lucía", last_name: "Martínez", email: "lucia.martinez@example.com", photo: "https://miapp.com/uploads/lucia.jpg" },
            { id: 5, name: "Andrés", last_name: "Rodríguez", email: "andres.rodriguez@example.com", photo: "https://miapp.com/uploads/andres.jpg" },
            { id: 6, name: "Sofía", last_name: "López", email: "sofia.lopez@example.com", photo: "https://miapp.com/uploads/sofia.jpg" },
            { id: 7, name: "Martín", last_name: "García", email: "martin.garcia@example.com", photo: "https://miapp.com/uploads/martin.jpg" }
          ]

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
