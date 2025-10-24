class CancelTutoringNotificationsJob < ApplicationJob
  queue_as :default

  def perform(tutoring_id)
    # Cancelar jobs programados para esta tutoría
    # Nota: Esto requiere que uses un sistema de colas que soporte cancelación
    # como Sidekiq con sidekiq-cron o similar
    
    # Para ActiveJob básico, podemos marcar la tutoría como cancelada
    # y verificar esto en los jobs de notificación
    tutoring = Tutoring.find(tutoring_id)
    tutoring.update!(cancelled_at: Time.current) if tutoring.respond_to?(:cancelled_at)
    
    Rails.logger.info "Cancelled notifications for tutoring #{tutoring_id}"
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn "CancelTutoringNotificationsJob: Tutoring #{tutoring_id} not found"
  end
end
