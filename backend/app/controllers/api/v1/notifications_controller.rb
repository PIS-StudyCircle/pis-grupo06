module Api
  module V1
    class NotificationsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_notification, only: [:update, :destroy]

      def index
        scope = current_user.notifications.order(Arel.sql("read_at IS NULL DESC"), created_at: :desc)

        render json: { notifications: scope.as_json(only: [:id, :title, :kind, :url, :created_at, :read_at,
                                                           :seen_at]) }
      end

      def update
        @notification.update!(read_at: Time.current) if params[:read] == true
        @notification.update!(seen_at: Time.current) if params[:seen] == true

        render json: { ok: true }
      end

      def mark_all_read
        current_user.notifications.unread.find_in_batches(batch_size: 500) do |batch|
          batch.each { |n| n.update!(read_at: Time.current) }
        end

        render json: { ok: true }
      end

      def mark_all_seen
        current_user.notifications.unseen.find_in_batches(batch_size: 500) do |batch|
          batch.each { |n| n.update!(seen_at: Time.current) }
        end

        render json: { ok: true }
      end

      def destroy
        @notification.destroy!

        render json: { ok: true }
      end

      def destroy_all
        current_user.notifications.in_batches(of: 500) do |batch|
          batch.each(&:destroy!)
        end

        render json: { ok: true }
      end

      private

      def set_notification
        @notification = current_user.notifications.find(params[:id])
      end
    end
  end
end
