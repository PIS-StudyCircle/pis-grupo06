module Api
  module V1
    module Users
      class ListController < ApplicationController
        include Pagy::Backend

        before_action :authenticate_user!, except: [:index]

        def index
          users = sample_users
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
            { id: 7, name: "Martín", last_name: "García", email: "martin.garcia@example.com", photo: "https://i.pravatar.cc/150?img=11" },
            { id: 8, name: "Valentina", last_name: "Morales", email: "valentina.morales@example.com", photo: "https://i.pravatar.cc/150?img=12" },
            { id: 9, name: "Diego", last_name: "Castro", email: "diego.castro@example.com", photo: "https://i.pravatar.cc/150?img=13" },
            { id: 10, name: "Florencia", last_name: "Rivas", email: "florencia.rivas@example.com", photo: "https://i.pravatar.cc/150?img=14" },
            { id: 11, name: "Mateo", last_name: "Cabrera", email: "mateo.cabrera@example.com", photo: "https://i.pravatar.cc/150?img=15" },
            { id: 12, name: "Julieta", last_name: "Romero", email: "julieta.romero@example.com", photo: "https://i.pravatar.cc/150?img=16" },
            { id: 13, name: "Agustín", last_name: "Sánchez", email: "agustin.sanchez@example.com", photo: "https://i.pravatar.cc/150?img=17" },
            { id: 14, name: "Camila", last_name: "Figueroa", email: "camila.figueroa@example.com", photo: "https://i.pravatar.cc/150?img=18" },
            { id: 15, name: "Gonzalo", last_name: "Méndez", email: "gonzalo.mendez@example.com", photo: "https://i.pravatar.cc/150?img=19" },
            { id: 16, name: "Antonella", last_name: "Suárez", email: "antonella.suarez@example.com", photo: "https://i.pravatar.cc/150?img=20" },
            { id: 17, name: "Nicolás", last_name: "Pereyra", email: "nicolas.pereyra@example.com", photo: "https://i.pravatar.cc/150?img=21" },
            { id: 18, name: "Paula", last_name: "Vega", email: "paula.vega@example.com", photo: "https://i.pravatar.cc/150?img=22" },
            { id: 19, name: "Tomás", last_name: "Luna", email: "tomas.luna@example.com", photo: "https://i.pravatar.cc/150?img=23" },
            { id: 20, name: "Carolina", last_name: "Ponce", email: "carolina.ponce@example.com", photo: "https://i.pravatar.cc/150?img=24" },
            { id: 21, name: "Sebastián", last_name: "Ortiz", email: "sebastian.ortiz@example.com", photo: "https://i.pravatar.cc/150?img=25" },
            { id: 22, name: "Martina", last_name: "Silva", email: "martina.silva@example.com", photo: "https://i.pravatar.cc/150?img=26" },
            { id: 23, name: "Felipe", last_name: "Ramírez", email: "felipe.ramirez@example.com", photo: "https://i.pravatar.cc/150?img=27" },
            { id: 24, name: "Isabella", last_name: "Domínguez", email: "isabella.dominguez@example.com", photo: "https://i.pravatar.cc/150?img=28" },
            { id: 25, name: "Francisco", last_name: "Cruz", email: "francisco.cruz@example.com", photo: "https://i.pravatar.cc/150?img=29" },
            { id: 26, name: "Josefina", last_name: "Herrera", email: "josefina.herrera@example.com", photo: "https://i.pravatar.cc/150?img=30" },
            { id: 27, name: "Matías", last_name: "Giménez", email: "matias.gimenez@example.com", photo: "https://i.pravatar.cc/150?img=31" },
            { id: 28, name: "Renata", last_name: "Navarro", email: "renata.navarro@example.com", photo: "https://i.pravatar.cc/150?img=32" },
            { id: 29, name: "Joaquín", last_name: "Torres", email: "joaquin.torres@example.com", photo: "https://i.pravatar.cc/150?img=33" },
            { id: 30, name: "Abril", last_name: "Medina", email: "abril.medina@example.com", photo: "https://i.pravatar.cc/150?img=34" }
          ]

        end

      end
    end
  end
end
