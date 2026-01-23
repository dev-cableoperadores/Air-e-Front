// components/FeatureStats.jsx

/**
 * Muestra estadísticas de las features cargadas
 */
function FeatureStats({ features }) {
  if (features.length === 0) return null;

  const pointCount = features.filter(f => f.type === 'Point').length;
  const lineCount = features.filter(f => f.type === 'LineString').length;
  const polygonCount = features.filter(f => f.type === 'Polygon').length;

  return (
    <div className="feature-stats">
      <div className="stat-item">
        <span className="stat-count">{pointCount}</span>
        <span className="stat-label">Puntos</span>
      </div>
      <div className="stat-item">
        <span className="stat-count">{lineCount}</span>
        <span className="stat-label">Líneas</span>
      </div>
      <div className="stat-item">
        <span className="stat-count">{polygonCount}</span>
        <span className="stat-label">Polígonos</span>
      </div>
    </div>
  );
}

export default FeatureStats;