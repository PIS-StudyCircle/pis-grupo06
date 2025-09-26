# app/controllers/api/v1/subjects_controller.rb
class Api::V1::SubjectsController < ApplicationController
  include JsonResponse

  def show
    subject = Course.find(params[:course_id]).subjects.find(params[:id])

    # Ver a que se refieren con "active tutorings"
    active_tutorings = subject.tutorings
                              .upcoming
                              .order(:scheduled_at)

    data = {
      id: subject.id,
      name: subject.name,
      course_id: subject.course_id,
      tutorings: active_tutorings.map do |t|
        {
          id: t.id,
          scheduled_at: t.scheduled_at,
          duration_mins: t.duration_mins,
          modality: t.modality,
          capacity: t.capacity,
          enrolled: t.enrolled,
          seats_left: t.capacity - t.enrolled,
          tutor_id: t.tutor_id
        }
      end
    }

    success_response(message: "Tema y tutorias cargadas con exito", data: data)
  rescue ActiveRecord::RecordNotFound
    error_response(message: "Tema no encontrado", status: :not_found)
  end
end
