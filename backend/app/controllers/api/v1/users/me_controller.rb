# frozen_string_literal: true

module Api
  module V1
    module Users
      class MeController < ApplicationController
        include Devise::Controllers::Helpers

        before_action :authenticate_user!

        def show
          render json: {
            user: UserSerializer.new(current_user,
                                     params: { current_user: current_user }).serializable_hash[:data][:attributes]
          }
        end
      end
    end
  end
end
