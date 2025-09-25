module Api
  module V1
    module Users
      class ListController < ApplicationController
        include Pagy::Backend
        before_action :authenticate_user!, except: [:index]

        def index
          # users = User.order(:name)
          users = [
            { id: 1, name: "Juan", last_name: "Pérez", email: "juan.perez@example.com", photo: "https://miapp.com/uploads/juan.jpg" },
            { id: 2, name: "María", last_name: "Gómez", email: "maria.gomez@example.com", photo: "https://miapp.com/uploads/maria.jpg" },
            { id: 3, name: "Carlos", last_name: "Fernández", email: "carlos.fernandez@example.com", photo: "https://miapp.com/uploads/carlos.jpg" },
            { id: 4, name: "Lucía", last_name: "Martínez", email: "lucia.martinez@example.com", photo: "https://miapp.com/uploads/lucia.jpg" },
            { id: 5, name: "Andrés", last_name: "Rodríguez", email: "andres.rodriguez@example.com", photo: "https://miapp.com/uploads/andres.jpg" },
            { id: 6, name: "Sofía", last_name: "López", email: "sofia.lopez@example.com", photo: "https://miapp.com/uploads/sofia.jpg" },
            { id: 7, name: "Martín", last_name: "García", email: "martin.garcia@example.com", photo: "https://miapp.com/uploads/martin.jpg" }
          ]

          # Filtro de búsqueda por nombre o apellido
          if params[:search].present?
            users = users.where(
              "unaccent(name) ILIKE unaccent(?) OR unaccent(last_name) ILIKE unaccent(?)",
              "%#{params[:search]}%", "%#{params[:search]}%"
            )
          end

          # Filtro por rol (si algún día agregás columna `role`)
          users = users.where(role: params[:role]) if params[:role].present? && User.column_names.include?("role")

          # Paginación con Pagy
          @pagy, @users = pagy(users, items: params[:per_page] || 20)

          render json: {
            users: @users.as_json(only: [:id, :name, :last_name, :email]), # + :photo si agregás la columna
            pagination: pagy_metadata(@pagy)
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
