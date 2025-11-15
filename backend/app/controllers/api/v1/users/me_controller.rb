# frozen_string_literal: true

module Api
  module V1
    module Users
      class MeController < ApplicationController
        include Devise::Controllers::Helpers

        before_action :authenticate_user!

        def show
          serialized_user = UserSerializer.new(
            current_user,
            params: { current_user: current_user },
          ).serializable_hash[:data][:attributes]

          render json: {
            user: serialized_user.merge(
              counts: {
                tutorias_dadas: current_user.tutorias_dadas_count,
                tutorias_recibidas: current_user.tutorias_recibidas_count,
                resenas_dadas: current_user.resenas_dadas_count,
                feedback_dado: current_user.feedback_dado_count,
              },
            ),
          }
        end
      end
    end
  end
end
