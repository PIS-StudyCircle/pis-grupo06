module Api
    module V1
        class SubjectsController < ApplicationController
            include Pagy::Backend

            def index
                subjects = Subject.order(:name)

                # Filtro de búsqueda por nombre
                subjects = subjects.where("unaccent(name) ILIKE unaccent(?)", "%#{params[:search]}%") if params[:search].present?
                
                # Filtro de búsqueda por id de curso                
                subjects = subjects.where(course_id: params[:course_id]) if params[:course_id].present?

                @pagy, @subjects = pagy(subjects, items: params[:per_page] || 20)

                render json: {
                    subjects: @subjects,
                    pagination: pagy_metadata(@pagy)
                }   
                
            end
        end
    end
end
