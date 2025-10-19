module Api
  module V1
    class TutoringsController < ApplicationController
      include Pagy::Backend

      before_action :set_tutoring, only: [:show, :update, :destroy, :confirm_schedule, :unsubscribe]

      before_action :authenticate_user!

      def index
        tutorings = Tutoring.all

        # tutorias en las que el usuario esta inscripto
        if params[:enrolled].present? && ActiveModel::Type::Boolean.new.cast(params[:enrolled])
          tutorings = tutorings.enrolled_by(current_user)
        end

        # tutorias de una materia especifica (por id de curso)
        if params[:course_id].present?
          tutorings = tutorings.by_course_id(params[:course_id])
        end

        # tutorias de una materia especifica (por id de subject)
        if params[:subject_id].present?
          tutorings = tutorings.joins(:subjects).where(subjects: { id: params[:subject_id] })
        end

        # tutorias creadas por el usuario indicado (no current_user,
        # esto por si se quiere ampliar a ver tutorias creadas por otros usuarios)
        if params[:created_by_user].present?
          tutorings = tutorings.created_by(params[:created_by_user])
        end

        # los que aun no tienen tutor asignado
        if params[:no_tutor].present? && ActiveModel::Type::Boolean.new.cast(params[:no_tutor])
          tutorings = tutorings.without_tutor

          # no aparecen las tutorias creadas por el usuario
          tutorings = tutorings.where.not(created_by_id: current_user.id)
        end

        # los que ya tienen tutor asignado y no estan pending
        if params[:with_tutor].present? && ActiveModel::Type::Boolean.new.cast(params[:with_tutor])
          tutorings = tutorings.with_tutor.where.not(state: "pending")

          # no aparecen las tutorias creadas por el usuario ni las que el usuario es tutor
          tutorings = tutorings
                      .where.not(created_by_id: current_user.id)
                      .where.not(tutor_id:      current_user.id)
        end

        # los que aun tienen cupo y tienen tutor asignado
        if params[:with_tutor_not_full].present? && ActiveModel::Type::Boolean.new.cast(params[:with_tutor_not_full])
          tutorings = tutorings.with_tutor_not_full
          Rails.logger.debug { "Tutorings with_tutor_not_full scope applied: #{tutorings.to_sql}" }

          # no aparecen las tutorias creadas por el usuario
          tutorings = tutorings.where.not(created_by_id: current_user.id)
        end

        q = params[:search].to_s
        search_by = params[:search_by].presence_in(%w[course subject]) || "course"

        tutorings =
          case search_by
          when "subject" then tutorings.search_by_subject_name(q)
          else tutorings.search_by_course_name(q)
          end

        # por defecto muestro las futuras o las que no tienen fecha asignada (así el tutor puede verlas y asignarse)
        if params[:past].present? && ActiveModel::Type::Boolean.new.cast(params[:past])
          tutorings = tutorings.past
        else
          tutorings = tutorings.where(
            'scheduled_at IS NULL OR scheduled_at > ?',
            Time.current
          )
        end

        @pagy, @tutorings = pagy(tutorings, items: params[:per_page] || 20)

        tutoring_ids = @tutorings.pluck(:id)
        @tutorings_with_includes = Tutoring.where(id: tutoring_ids)
                                           .includes(:course, :subjects)
                                           .order(:id)

        render json: {
          tutorings: @tutorings_with_includes.map do |t|
            {
              id: t.id,
              scheduled_at: t.scheduled_at,
              duration_mins: t.duration_mins,
              modality: t.modality,
              capacity: t.capacity,
              enrolled: t.enrolled,

              course: {
                id: t.course.id,
                name: t.course.name,
                code: t.course.code
              },
              subjects: t.subjects.map { |s| { id: s.id, name: s.name } },
              enrolled_students: t.users.map do |user|
                {
                  id: user.id,
                }
              end,
              created_by_id: t.created_by_id,
              tutor_id: t.tutor_id,
              state: t.state,
              request_comment: t.request_comment,
              request_due_at: t.request_due_at,
              tutor_name: t.tutor&.name,
              tutor_last_name: t.tutor&.last_name,
              location: t.location,
              availabilities: t.tutoring_availabilities.map do |a|
                { id: a.id, start_time: a.start_time, end_time: a.end_time, is_booked: a.is_booked }
              end,
              tutor_email: t.tutor&.email,
            }
          end,
          pagination: pagy_metadata(@pagy)
        }
      end

      def show
        render json: {
          id: @tutoring.id,
          scheduled_at: @tutoring.scheduled_at,
          duration_mins: @tutoring.duration_mins,
          modality: @tutoring.modality,
          capacity: @tutoring.capacity,
          enrolled: @tutoring.enrolled,
          state: @tutoring.state,
          request_comment: @tutoring.request_comment,
          request_due_at: @tutoring.request_due_at,
          location: @tutoring.location,
          course: {
            id: @tutoring.course.id,
            name: @tutoring.course.name,
            code: @tutoring.course.code
          },
          subjects: @tutoring.subjects.map { |s| { id: s.id, name: s.name } },
          created_by: @tutoring.created_by ? {
            id: @tutoring.created_by.id,
            name: @tutoring.created_by.name,
            last_name: @tutoring.created_by.last_name,
            email: @tutoring.created_by.email
          } : nil,
          tutor: @tutoring.tutor ? {
            id: @tutoring.tutor.id,
            name: @tutoring.tutor.name,
            last_name: @tutoring.tutor.last_name
          } : nil,
          availabilities: @tutoring.tutoring_availabilities.map do |a|
            {
              id: a.id,
              start_time: a.start_time,
              end_time: a.end_time,
              is_booked: a.is_booked
            }
          end
        }
      end

      def create
        # if params[:tutoring][:subject_ids].blank?
        #   render json: { errors: ["No se recibieron correctamente los temas seleccionados. Inténtelo nuevamente."] },
        #          status: :unprocessable_entity
        #   return
        # end

        tutoring = Tutoring.new(tutoring_params)
        tutoring.created_by_id = current_user.id
        tutoring.tutor_id      = params.dig(:tutoring, :tutor_id)
        tutoring.course_id     = params.dig(:tutoring, :course_id)

        if tutoring.tutor_id.nil? && tutoring.capacity.nil?
          tutoring.capacity = nil # Valor por defecto para solicitudes pendientes
        end

        # Validar overlapping con las availabilities antes de crearlas
        if params[:tutoring][:availabilities_attributes].present?
          if availability_overlaps?(params[:tutoring][:availabilities_attributes], current_user.id)
            render json: {
              errors: ["Ya tienes una tutoría programada en esa fecha y horario"]
            }, status: :unprocessable_entity
            return
          end
        end

        ActiveRecord::Base.transaction do
          if tutoring.save
            # Crear disponibilidades si vienen en los parámetros
            if params[:tutoring][:availabilities_attributes].present?
              params[:tutoring][:availabilities_attributes].each do |availability_params|
                next if availability_params[:_destroy] == '1' || availability_params[:_destroy] == true

                tutoring.tutoring_availabilities.create!(
                  start_time: availability_params[:start_time],
                  end_time: availability_params[:end_time],
                  is_booked: false
                )
              end
            end

            create_user_tutoring(current_user.id, tutoring.id)
            render json: {
              tutoring: tutoring.as_json.merge(
                availabilities: tutoring.tutoring_availabilities.as_json
              )
            }, status: :created
          else
            render json: { errors: tutoring.errors.full_messages }, status: :unprocessable_entity
          end
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end

      def update
        if @tutoring.update(tutoring_update_params)
          render json: {
            message: "Tutoría actualizada exitosamente",
            tutoring: @tutoring
          }

        else
          render json: { errors: @tutoring.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @tutoring.destroy
        head :no_content
      end

      def exists_user_tutoring
        tutoring_id = params[:id]
        exists = UserTutoring.exists?(user_id: current_user.id, tutoring_id: tutoring_id)
        render json: { exists: exists }
      end

      def join_tutoring
        tid = params[:id]
        @tutoring = Tutoring.find(tid)

        if UserTutoring.exists?(user_id: current_user.id, tutoring_id: tid)
          render json: { error: "Ya perteneces a esta tutoría." }, status: :conflict and return
        end

        # Inscribir al estudiante
        UserTutoring.create!(user_id: current_user.id, tutoring_id: @tutoring.id)

        # Incrementar contador de inscritos
        # @tutoring.update!(enrolled: @tutoring.enrolled + 1)

        # Si no existe evento, crearlo con el tutor y agregarse
        begin
          if @tutoring.event_id.blank?
            # Crear evento desde el calendario del tutor
            tutor = @tutoring.tutor
            calendar_service = GoogleCalendarService.new(tutor)
            end_time = scheduled_time + @tutoring.duration_mins.minutes

            course_name = @tutoring.course&.name || "Tutoría"

            event_params = {
              title: "Tutoría - #{course_name}",
              description: build_tutoring_description,
              start_time: scheduled_time.iso8601,
              end_time: end_time.iso8601
            }

            calendar_service.create_event(@tutoring, event_params)
          end

          # Agregar al estudiante actual al evento
          tutor = @tutoring.tutor
          calendar_service = GoogleCalendarService.new(tutor)
          calendar_service.join_event(@tutoring, current_user.email)

          # Agregar a todos los demás estudiantes ya inscritos
          existing_students = @tutoring.user_tutorings
                                       .where.not(user_id: current_user.id)
                                       .includes(:user)

          existing_students.each do |user_tutoring|
            student = user_tutoring.user
            next if student.id == tutor.id # No agregar al tutor como estudiante

            calendar_service.join_event(@tutoring, student.email)
          end
        rescue => e
          Rails.logger.error "Error al manejar evento de Google Calendar: #{e.message}"
          # No fallar la transacción por errores de calendario
        end

        render json: {
          ok: true,
          enrolled: @tutoring.reload.enrolled,
          tutoring_id: @tutoring.id
        }, status: :created
      end

      def confirm_schedule
        # Parsear el horario elegido
        scheduled_time = Time.zone.parse(params[:scheduled_at])
        end_time = params[:end_time].present? ? Time.zone.parse(params[:end_time])
                                              : scheduled_time + @tutoring.duration_mins.minutes
        user_role = params[:role] # 'student' o 'tutor'

        # Validar que se especifique el rol
        unless ['student', 'tutor'].include?(user_role)
          return render json: {
            error: "Debe especificar el rol: 'student' o 'tutor'"
          }, status: :unprocessable_entity
        end

        # Buscar una disponibilidad que contenga ese horario
        chosen_end = end_time
        availability = @tutoring.tutoring_availabilities.available.find do |a|
          scheduled_time >= a.start_time && chosen_end <= a.end_time
        end

        unless availability
          return render json: {
            error: "El horario elegido no está dentro de las disponibilidades ofrecidas"
          }, status: :unprocessable_entity
        end

        # Validar que haya tiempo suficiente para la duración de la tutoría
        tutoring_end_time = end_time || (scheduled_time + @tutoring.duration_mins.minutes)
        if tutoring_end_time > availability.end_time
          return render json: {
            error: "No hay tiempo suficiente en esa franja horaria. La tutoría dura #{@tutoring.duration_mins} minutos."
          }, status: :unprocessable_entity
        end

        # Validar que no haya tutorías que se solapen con este horario
        overlapping_tutorings = check_overlapping_tutorings(scheduled_time, tutoring_end_time, current_user.id)
        if overlapping_tutorings.any?
          return render json: {
            error: "Ya tienes tutorías programadas en ese horario"
          }, status: :unprocessable_entity
        end

        if user_role == 'student'
          # Validaciones específicas para estudiantes
          if @tutoring.enrolled >= @tutoring.capacity
            return render json: {
              error: "La tutoría ya alcanzó su capacidad máxima"
            }, status: :unprocessable_entity
          end

          # Verificar que la tutoría ya tenga un tutor asignado
          if @tutoring.tutor_id.blank?
            return render json: {
              error: "Esta tutoría aún no tiene un tutor asignado"
            }, status: :unprocessable_entity
          end

          # Verificar que el estudiante no esté ya inscrito
          if UserTutoring.exists?(user_id: current_user.id, tutoring_id: @tutoring.id)
            return render json: {
              error: "Ya estás inscrito en esta tutoría"
            }, status: :unprocessable_entity
          end
        elsif user_role == 'tutor'
          # Validaciones específicas para tutores
          if @tutoring.tutor_id.present?
            return render json: {
              error: "Esta tutoría ya tiene un tutor asignado"
            }, status: :unprocessable_entity
          end

          # Verificar que el tutor no esté ya en la tutoría
          if UserTutoring.exists?(user_id: current_user.id, tutoring_id: @tutoring.id)
            return render json: {
              error: "Ya estás registrado en esta tutoría"
            }, status: :unprocessable_entity
          end
        end

        # Calcular duración real (en minutos)
        duration = ((end_time - scheduled_time) / 60).to_i

        ActiveRecord::Base.transaction do
          # Confirmar el horario de la tutoría
          @tutoring.update!(scheduled_at: scheduled_time, duration_mins: duration, state: 'active')

          # Marcar la disponibilidad como reservada
          availability.update!(is_booked: true)

          if user_role == 'student'
            # Inscribir al estudiante
            UserTutoring.create!(user_id: current_user.id, tutoring_id: @tutoring.id)

            # Incrementar contador de inscritos
            # @tutoring.update!(enrolled: @tutoring.enrolled + 1)

            # Si no existe evento, crearlo con el tutor y agregarse
            begin
              if @tutoring.event_id.blank?
                # Crear evento desde el calendario del tutor
                tutor = @tutoring.tutor
                calendar_service = GoogleCalendarService.new(tutor)

                course_name = @tutoring.course&.name || "Tutoría"

                event_params = {
                  title: "Tutoría - #{course_name}",
                  description: build_tutoring_description(end_time),
                  start_time: scheduled_time.iso8601,
                  end_time: end_time.iso8601
                }

                calendar_service.create_event(@tutoring, event_params)
              end

              # Agregar al estudiante actual al evento
              tutor = @tutoring.tutor
              calendar_service = GoogleCalendarService.new(tutor)
              calendar_service.join_event(@tutoring, current_user.email)

              # Agregar a todos los demás estudiantes ya inscritos
              existing_students = @tutoring.user_tutorings
                                           .where.not(user_id: current_user.id)
                                           .includes(:user)

              existing_students.each do |user_tutoring|
                student = user_tutoring.user
                next if student.id == tutor.id # No agregar al tutor como estudiante

                calendar_service.join_event(@tutoring, student.email)
              end
            rescue => e
              Rails.logger.error "Error al manejar evento de Google Calendar: #{e.message}"
              # No fallar la transacción por errores de calendario
            end

            "Te inscribiste exitosamente en la tutoría"
          else # tutor
            # Asignar el tutor en la tabla tutorings
            @tutoring.update!(tutor_id: current_user.id)

            # Crear registro en user_tutorings para el tutor
            UserTutoring.create!(user_id: current_user.id, tutoring_id: @tutoring.id)

            # Agregar también al estudiante creador si no está registrado aún
            if @tutoring.created_by_id.present? &&
               !UserTutoring.exists?(user_id: @tutoring.created_by_id, tutoring_id: @tutoring.id)
              UserTutoring.create!(user_id: @tutoring.created_by_id, tutoring_id: @tutoring.id)
            end

            # Crear evento en Google Calendar y agregar a todos los estudiantes
            begin
              calendar_service = GoogleCalendarService.new(current_user)

              # Actualizar datos antes de crear el evento
              if params[:capacity].present?
                new_cap = params[:capacity].to_i
                raise ActiveRecord::RecordInvalid.new(@tutoring), "Capacidad inválida" if new_cap <= 0

                @tutoring.capacity = new_cap
              end

              @tutoring.assign_attributes(
                scheduled_at: scheduled_time,
                tutor_id: current_user.id,
                capacity: new_cap.presence || @tutoring.capacity,
              )
              @tutoring.save!

              # Construir evento con datos actualizados
              course_name = @tutoring.course&.name || "Tutoría"
              event_params = {
                title: "Tutoría - #{course_name}",
                description: build_tutoring_description(end_time), # usa los datos actualizados
                start_time: scheduled_time.iso8601,
                end_time: end_time.iso8601
              }

              # Crear evento en Calendar
              calendar_service.create_event(@tutoring, event_params)

              # Agregar al creador si tiene email
              if @tutoring.creator&.email.present?
                calendar_service.join_event(@tutoring, @tutoring.creator.email)
              end

              # Agregar a todos los estudiantes ya inscritos
              existing_students = @tutoring.user_tutorings
                                           .where.not(user_id: current_user.id)
                                           .includes(:user)

              existing_students.each do |user_tutoring|
                student = user_tutoring.user
                calendar_service.join_event(@tutoring, student.email)
              end
            rescue => e
              Rails.logger.error "Error al crear evento en Google Calendar: #{e.message}"
              # No fallar la transacción por errores de calendario
            end

            "Fuiste asignado como tutor exitosamente"
          end
        end

        # Enviar notificaciones según el rol
        if user_role == 'student'
          # TutoringMailer.student_enrolled(@tutoring, current_user).deliver_later
        else
          # TutoringMailer.tutor_assigned(@tutoring, current_user).deliver_later
        end

        render json: {
          tutoring: {
            id: @tutoring.id,
            scheduled_at: @tutoring.scheduled_at,
            tutor_id: @tutoring.tutor_id,
            enrolled: @tutoring.enrolled,
            event_id: @tutoring.event_id
          }
        }, status: :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue ArgumentError
        render json: { error: "Formato de fecha inválido" }, status: :unprocessable_entity
      rescue => e
        Rails.logger.error "Error inesperado en confirm_schedule: #{e.message}"
        render json: { error: "Error interno del servidor" }, status: :internal_server_error
      end

      def build_tutoring_description(end_time = nil)
        description = []
        description << "Modalidad: #{@tutoring.modality}"

        # Calcular duración real si hay horario definido
        if @tutoring.scheduled_at && end_time
          duration = ((end_time - @tutoring.scheduled_at) / 60).to_i
          description << "Duración: #{duration} minutos"
        elsif @tutoring.duration_mins.present?
          description << "Duración: #{@tutoring.duration_mins} minutos"
        end

        if @tutoring.capacity.present?
          description << "Capacidad: #{@tutoring.capacity} #{'estudiante'.pluralize(@tutoring.capacity)}"
        end
        description << "Ubicación: #{@tutoring.location}" if @tutoring.location.present?
        # description << "\n#{@tutoring.request_comment}" if @tutoring.request_comment.present?

        description.join("\n")
      end

      # backend/app/controllers/api/v1/tutorings_controller.rb
      def upcoming
        user = User.find(params[:user_id])

        tutorings = Tutoring
                    .enrolled_by(user)
                    .upcoming
                    .where(state: :active)
                    .includes(:tutor, :course)
                    .order(:scheduled_at)

        render json: tutorings.map { |t|
          is_tutor = t.tutor_id == user.id
          {
            id: t.id,
            subject: t.course&.name,
            tutor: t.tutor&.name || "Sin asignar",
            date: t.scheduled_at,
            duration: t.duration_mins,
            location: t.location.presence || "Virtual",
            status: t.state,
            role: is_tutor ? "tutor" : "student",
            attendees: t.users.map { |u| { email: u.email, status: "confirmada" } },
            url: nil
          }
        }
      end

      # DELETE /api/v1/tutorings/:id/unsubscribe
      # DELETE /api/v1/tutorings/:id/unsubscribe
    def unsubscribe
      ActiveRecord::Base.transaction do
        @tutoring.lock!

        calendar = GoogleCalendarService.for_owner(@tutoring)

        was_tutor       = (@tutoring.tutor_id.present? && @tutoring.tutor_id == current_user.id)
        had_tutor       = @tutoring.tutor_id.present?
        prev_enrolled   = @tutoring.enrolled.to_i
        event_confirmed = @tutoring.event_id.present?

        # 1) Si el que se va es el tutor -> SIEMPRE borrar tutoría (+ evento si existe)
        if was_tutor
          # (Comentario futuro) notificar a estudiantes que el tutor canceló
          begin
            calendar.delete_event(@tutoring) if event_confirmed
          rescue => e
            Rails.logger.error "Calendar delete_event (se va tutor) error: #{e.message}"
          end

          @tutoring.destroy!
          return head :no_content
        end

        # 2) Es estudiante: quitar relación + actualizar contador
        user_tutoring = UserTutoring.find_by!(user_id: current_user.id, tutoring_id: @tutoring.id)
        user_tutoring.destroy!

        new_enrolled = [prev_enrolled - 1, 0].max
        @tutoring.update!(enrolled: new_enrolled)

        # 3) Caso borde: si NO hay tutor y NO quedan estudiantes -> borrar todo
        if !had_tutor && new_enrolled.zero?
          begin
            calendar.delete_event(@tutoring) if event_confirmed
          rescue => e
            Rails.logger.error "Calendar delete_event (no tutor y sin estudiantes) error: #{e.message}"
          end

          @tutoring.destroy!
          return head :no_content
        end

        # 4) Caso normal: la tutoría queda viva -> remover del evento (si existe)
        if event_confirmed
          begin
            calendar.leave_event(@tutoring, current_user.email)
          rescue => e
            Rails.logger.error "Calendar leave_event error (continuamos): #{e.message}"
          end
        end
      end

      head :no_content
    end


      private

      def set_tutoring
        @tutoring = Tutoring.find(params[:id])
      end

      def create_user_tutoring(user, tutoring)
        return if user.blank? || tutoring.blank?

        UserTutoring.find_or_create_by!(user_id: user, tutoring_id: tutoring)
      end

      def tutoring_params
        params.expect(
          tutoring: [
            :scheduled_at,
            :duration_mins,
            :modality,
            :capacity,
            :enrolled,
            :course_id,
            :tutor_id,
            :created_by_id,
            :request_due_at,
            :request_comment,
            :location,
            { subject_ids: [] },
            { availabilities_attributes: [:id, :start_time, :end_time, :_destroy] }
          ]
        )
      end

      def tutoring_update_params
        params.expect(
          tutoring: [
            :scheduled_at,
            :duration_mins,
            :modality,
            :capacity,
            :location,
            :request_comment,
            :request_due_at,
            { subject_ids: [] },
            { availabilities_attributes: [:id, :start_time, :end_time, :_destroy] }
          ]
        )
      end

      def check_overlapping_tutorings(start_time, end_time, user_id)
        # Buscar tutorías donde el usuario está involucrado (como tutor, creador o estudiante)
        # que se solapen con el horario especificado
        Tutoring.joins(:user_tutorings)
                .where.not(id: @tutoring&.id) # Excluir la tutoría actual si existe
                .where(
                  "(scheduled_at < ? AND (scheduled_at + INTERVAL '1 minute' * duration_mins) > ?) OR " +
                  "(scheduled_at >= ? AND scheduled_at < ?)",
                  end_time, start_time, start_time, end_time
                )
                .where(
                  "user_tutorings.user_id = ? OR tutor_id = ? OR created_by_id = ?",
                  user_id, user_id, user_id
                )
                .distinct
      end

      def availability_overlaps?(availabilities_params, user_id)
        availabilities_params.any? do |availability_params|
          next if availability_params[:_destroy] == '1' || availability_params[:_destroy] == true

          start_time = Time.zone.parse(availability_params[:start_time])
          end_time = Time.zone.parse(availability_params[:end_time])

          # Buscar si hay tutorías que se solapen con esta availability
          check_overlapping_tutorings(start_time, end_time, user_id).any?
        end
      end

        


    end
  end
end
