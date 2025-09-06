class UsersController < ApplicationController
    before_action :authenticate_user!, only: [:index, :show]
  
    def index
      users = User.all
      render json: users
    end
  
    def create
      user = User.new(user_params)
      if user.save
        render json: { message: 'Usuario creado' }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    def show
      user = User.find(params[:id])
      render json: user
    end
  
    private
  
    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation, :name, :last_name, :description)
    end
end