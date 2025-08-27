
module Api
  module V1
    class ArticlesController < ApplicationController
      # Si estás en modo API, ApplicationController ya hereda de ActionController::API
      # Si no, añadí: include ActionController::MimeResponds

      before_action :set_article, only: [:show, :update]

      def index
        articles = "holaaaaa"
        render json: { message: "holaaaaa" }, status: :ok
      end

      def show
        render json: @article, status: :ok
      end

      def create
        article = Article.new(article_params)
        if article.save
          render json: article, status: :created
        else
          render json: { errors: article.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @article.update(article_params)
          render json: @article, status: :ok
        else
          render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end