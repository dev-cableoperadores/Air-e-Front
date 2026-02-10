// utils/kmlParser.js

const extractStyles = (kmlDoc) => {
  const styleMap = {};
  
  // 1. Procesar <Style> directos
  const styles = kmlDoc.getElementsByTagName('Style');
  for (let style of styles) {
    const id = style.getAttribute('id');
    const icon = style.getElementsByTagName('Icon')[0];
    if (id && icon) {
      const href = icon.getElementsByTagName('href')[0]?.textContent;
      if (href) styleMap[`#${id}`] = href.trim();
    }
  }

  // 2. Procesar <StyleMap> (Mapean un ID a un Style normal)
  // Esto es necesario porque Google Earth suele usar StyleMaps (msn_ylw-pushpin)
  const styleMaps = kmlDoc.getElementsByTagName('StyleMap');
  for (let sm of styleMaps) {
    const id = sm.getAttribute('id');
    const pair = sm.getElementsByTagName('Pair');
    // Buscamos el estilo 'normal' dentro del mapa
    for (let p of pair) {
      const key = p.getElementsByTagName('key')[0]?.textContent;
      const styleUrl = p.getElementsByTagName('styleUrl')[0]?.textContent;
      if (key === 'normal' && styleUrl) {
        // Resolvemos la referencia final buscando en lo que ya procesamos
        const finalUrl = styleMap[styleUrl];
        if (finalUrl) {
          styleMap[`#${id}`] = finalUrl;
        }
      }
    }
  }
  return styleMap;
};
/**
 * Parsea un string KML a formato GeoJSON
 */
export const parseKML = (kmlString) => {
  const parser = new DOMParser();
  const kml = parser.parseFromString(kmlString, 'text/xml');
  const styles = extractStyles(kml);
  const placemarks = kml.getElementsByTagName('Placemark');
  const features = [];

  for (let placemark of placemarks) {
    const name = placemark.getElementsByTagName('name')[0]?.textContent || 'Sin nombre';
    const description = placemark.getElementsByTagName('description')[0]?.textContent || '';
    // 2. Determinamos el ícono de este Placemark
    let iconUrl = '';
    const styleUrlTag = placemark.getElementsByTagName('styleUrl')[0];
    if (styleUrlTag) {
      const styleId = styleUrlTag.textContent.trim();
      iconUrl = styles[styleId] || '';
      //console.log(`Procesando Placemark: ${name}, Icono: ${iconUrl}`);
    }
    // 3. Lógica para detectar si es POSTE basándonos en el ícono
    const isPosteIcon = iconUrl.includes('placemark_circle') || 
                        iconUrl.includes('shapes/placemark_circle.png');
    // Extraer coordenadas de Point
    const point = placemark.getElementsByTagName('Point')[0];
    if (point) {
      const coords = point.getElementsByTagName('coordinates')[0]?.textContent.trim();
      if (coords) {
        const [lon, lat, alt] = coords.split(',').map(parseFloat);
        const type = isPosteIcon ? 'Poste' : 'Point';
        features.push({
          type: type,
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

  //console.log("Procesando proyectos para el mapa:", imports.length);

  imports.forEach(importData => {
    if (importData.features && Array.isArray(importData.features)) {
      importData.features.forEach(feature => {
        const type = feature.feature_type.toLowerCase();
        const points = feature.points || [];

        if (points.length === 0) return;

        if (type === 'point' || type === 'poste') {
          features.push({
            type: type === 'poste' ? 'Poste' : 'Point',
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

  //console.log("Total de geometrías procesadas:", features);
  return features;
};