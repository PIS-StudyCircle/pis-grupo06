# app/jobs/cerrar_ranking_tutores_mes_job.rb
class CerrarRankingTutoresMesJob < ApplicationJob
  queue_as :default
  TOP_N = 5

  # Por defecto cierra el mes anterior (si hoy es 2025-11-08 → calcula 2025-10)
  def perform(periodo = (Time.zone.today.beginning_of_month - 1.day).beginning_of_month, force: false)
    # Guardia: si ya hay filas para ese periodo y no se forzó, no recalcula
    if already_closed?(periodo) && !force
      Rails.logger.info("CerrarRankingTutoresMesJob: ranking ya cerrado para #{periodo} (skip)")
      return
    end

    desde = periodo.beginning_of_month
    hasta = periodo.end_of_month.end_of_day

    sql = <<~SQL
      WITH base AS (
        SELECT
          f.tutor_id,
          AVG(f.rating)::numeric(4,2) AS average_rating,
          COUNT(f.id)::int            AS total_feedbacks
        FROM feedbacks f
        WHERE f.created_at >= $1
          AND f.created_at <= $2
        GROUP BY f.tutor_id
      ),
      ranked AS (
        SELECT
          tutor_id,
          average_rating,
          total_feedbacks,
          ROW_NUMBER() OVER (ORDER BY average_rating DESC, total_feedbacks DESC, tutor_id ASC) AS rk
        FROM base
      )
      SELECT tutor_id, average_rating, total_feedbacks, rk
      FROM ranked
      WHERE rk <= $3
      ORDER BY rk
    SQL

    binds = [
      ActiveRecord::Relation::QueryAttribute.new("desde", desde, ActiveRecord::Type::DateTime.new),
      ActiveRecord::Relation::QueryAttribute.new("hasta", hasta, ActiveRecord::Type::DateTime.new),
      ActiveRecord::Relation::QueryAttribute.new("topn",  TOP_N,  ActiveRecord::Type::Integer.new),
    ]

    rows = ActiveRecord::Base.connection.exec_query(sql, "ranking_mes", binds)

    ActiveRecord::Base.transaction do
      top_ids = []

      rows.each do |r|
        RankingMonth.upsert(
          {
            periodo:         periodo,
            tutor_id:        r["tutor_id"],
            average_rating:  r["average_rating"],
            total_feedbacks: r["total_feedbacks"],
            rank:            r["rk"]
          },
          unique_by: [:periodo, :tutor_id]
        )
        top_ids << r["tutor_id"]
      end

      # Prune: eliminar cualquier fila del mismo mes que no esté en el top N
      RankingMonth.where(periodo: periodo).where.not(tutor_id: top_ids).delete_all
    end

    Rails.logger.info "CerrarRankingTutoresMesJob: cerrado #{periodo} (#{rows.count} tutores, top #{TOP_N})"
  rescue => e
    Rails.logger.error "CerrarRankingTutoresMesJob ERROR: #{e.class} - #{e.message}"
    raise
  end

  private

  def already_closed?(periodo)
    RankingMonth.where(periodo: periodo).exists?
  end
end