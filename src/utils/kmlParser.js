// utils/kmlParser.js

/**
 * Parsea un string KML a formato GeoJSON
 */
export const parseKML = (kmlString) => {
  const parser = new DOMParser();
  const kml = parser.parseFromString(kmlString, 'text/xml');
  const placemarks = kml.getElementsByTagName('Placemark');
  const features = [];

  for (let placemark of placemarks) {
    const name = placemark.getElementsByTagName('name')[0]?.textContent || 'Sin nombre';
    const description = placemark.getElementsByTagName('description')[0]?.textContent || '';

    // Extraer coordenadas de Point
    const point = placemark.getElementsByTagName('Point')[0];
    if (point) {
      const coords = point.getElementsByTagName('coordinates')[0]?.textContent.trim();
      if (coords) {
        const [lon, lat, alt] = coords.split(',').map(parseFloat);
        features.push({
          type: 'Point',
          name,
          description,
          coordinates: { lat, lon, alt: alt || 0 }
        });
      }
    }

    // Extraer coordenadas de LineString
    const lineString = placemark.getElementsByTagName('LineString')[0];
    if (lineString) {
      const coords = lineString.getElementsByTagName('coordinates')[0]?.textContent.trim();
      if (coords) {
        const points = coords.split(/\s+/).map(coord => {
          const [lon, lat, alt] = coord.split(',').map(parseFloat);
          return { lat, lon, alt: alt || 0 };
        });
        features.push({
          type: 'LineString',
          name,
          description,
          coordinates: points
        });
      }
    }

    // Extraer coordenadas de Polygon
    const polygon = placemark.getElementsByTagName('Polygon')[0];
    if (polygon) {
      const outerBoundary = polygon.getElementsByTagName('outerBoundaryIs')[0];
      if (outerBoundary) {
        const coords = outerBoundary.getElementsByTagName('coordinates')[0]?.textContent.trim();
        if (coords) {
          const points = coords.split(/\s+/).map(coord => {
            const [lon, lat, alt] = coord.split(',').map(parseFloat);
            return { lat, lon, alt: alt || 0 };
          });
          features.push({
            type: 'Polygon',
            name,
            description,
            coordinates: points
          });
        }
      }
    }
  }

  return features;
};

/**
 * Convierte datos de Django al formato de features para el mapa
 */
export const convertDjangoToFeatures = (djangoData) => {
  const features = [];
  
  // Extraer la lista real de proyectos (manejando la paginación de Django)
  const imports = djangoData.results 
    ? djangoData.results 
    : (Array.isArray(djangoData) ? djangoData : [djangoData]);

  console.log("Procesando proyectos para el mapa:", imports.length);

  imports.forEach(importData => {
    if (importData.features && Array.isArray(importData.features)) {
      importData.features.forEach(feature => {
        const type = feature.feature_type.toLowerCase();
        const points = feature.points || [];

        if (points.length === 0) return;

        if (type === 'point') {
          features.push({
            type: 'Point',
            // nombre del proyecto
            proyecto: importData.filename || 'Sin nombre',
            name: feature.name,
            description: feature.description,
            coordinates: {
              lat: parseFloat(points[0].latitude),
              lon: parseFloat(points[0].longitude)
            }
          });
        } else if (type === 'linestring' || type === 'polygon') {
          features.push({
            type: type === 'linestring' ? 'LineString' : 'Polygon',
            name: feature.name,
            description: feature.description,
            coordinates: points.map(p => ({
              lat: parseFloat(p.latitude),
              lon: parseFloat(p.longitude)
            }))
          });
        }
      });
    }
  });

  console.log("Total de geometrías procesadas:", features);
  return features;
};