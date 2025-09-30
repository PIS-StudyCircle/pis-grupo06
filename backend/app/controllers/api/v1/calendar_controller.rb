# frozen_string_literal: true

module Api
  module V1
    class CalendarController < ApplicationController
      before_action :authenticate_user!

      # POST /api/v1/calendar/sessions
      def create
        tutoring = current_user.tutorings.build(tutoring_params)

        if tutoring.save
          # Crear el evento en Google Calendar
          event = GoogleCalendarService.new(current_user).create_event(tutoring)
          tutoring.update!(event_id: event.id)

          render json: { success: true, tutoring: tutoring, event: event.to_h }, status: :created
        else
          render json: { success: false, errors: tutoring.errors.full_messages }, status: :unprocessable_entity
        end
      end


      # POST /api/v1/calendar/sessions/:id/join
      def join
        tutoring = Tutoring.find(params[:id])
        event = GoogleCalendarService.new(current_user).join_event(tutoring, current_user.email)
        render json: { success: true, event: event.to_h }
      rescue => e
        render json: { success: false, error: e.message }, status: :unprocessable_entity
      end

      # GET /api/v1/calendar/sessions/:id
      def show
        tutoring = Tutoring.find(params[:id])
        event = GoogleCalendarService.new(current_user).get_event(tutoring)
        render json: event.to_h
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # GET /api/v1/calendar/sessions/upcoming
      def upcoming
        events = GoogleCalendarService.new(current_user).list_upcoming_events(10)
        render json: events.map(&:to_h)
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # DELETE /api/v1/calendar/sessions/:id
      def destroy
        tutoring = Tutoring.find(params[:id])
        GoogleCalendarService.new(current_user).delete_event(tutoring)
        render json: { success: true }
      rescue => e
        render json: { success: false, error: e.message }, status: :unprocessable_entity
      end
    end
  end
end
