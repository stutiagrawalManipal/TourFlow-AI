/**
 * Crowd service - DEMO ONLY
 * There is no camera / sensor / ML crowd detection yet.
 * For now the crowd level is estimated from the dataset's popularity_score
 * so the existing crowd badges have something sensible to show.
 */

export function getDemoCrowd(popularityScore) {
  let crowdLevel = 'LOW';
  if (popularityScore >= 9) crowdLevel = 'HIGH';
  else if (popularityScore >= 7) crowdLevel = 'MODERATE';

  return {
    crowdLevel,
    crowdPercent: Math.min(popularityScore * 9, 95),
  };
}
