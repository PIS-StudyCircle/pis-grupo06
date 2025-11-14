import * as Insignas from "@/shared/utils/Insignas.js";

export function useBadges(counts = {}) {
  const { 
    tutorias_dadas = 0,
    tutorias_recibidas = 0,
    resenas_dadas = 0,
    feedback_dado = 0,
  } = counts;

  const getBadgeLevel = (count) => {
    if (count >= 6) return 3;
    if (count >= 3) return 2;
    if (count >= 1) return 1;
    return 0;
  };

  const getBadgeImage = (type, count) => {
    const level = getBadgeLevel(count);
    if (level === 0) return null;

    switch (type) {
      case "tutorias_dadas":
        return Insignas[`TUTORIAS_DADAS_${level}`];
      case "tutorias_recibidas":
        return Insignas[`TUTORIAS_RECIBIDAS_${level}`];
      case "resenas_dadas":
        return Insignas[`RESENAS_DADAS_${level}`];
      case "feedback_dado":
        return Insignas[`FEEDBACK_DADO_${level}`];
      default:
        return null;
    }
  };

  return {
    tutorias_dadas: getBadgeImage("tutorias_dadas", tutorias_dadas),
    tutorias_recibidas: getBadgeImage("tutorias_recibidas", tutorias_recibidas),
    resenas_dadas: getBadgeImage("resenas_dadas", resenas_dadas),
    feedback_dado: getBadgeImage("feedback_dado", feedback_dado),
  };
}
