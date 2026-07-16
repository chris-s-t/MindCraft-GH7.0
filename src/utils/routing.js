/**
 * Calculates distance in meters between two lat/lng coordinates using the Haversine formula
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks which hazards lie within a specific threshold (in meters) of a route path
 * @param {Array} routeCoordinates - Array of [lat, lng] representing the route path
 * @param {Array} activeHazards - Array of active hazard reports from Supabase
 * @param {number} thresholdMeters - Distance threshold (default 60 meters)
 * @returns {Array} Hazards that are close to the route
 */
export function findHazardsOnRoute(routeCoordinates, activeHazards, thresholdMeters = 60) {
  const hazardsOnRoute = [];

  activeHazards.forEach((hazard) => {
    // Skip resolved hazards
    if (hazard.status === 'resolved') return;

    let minDistance = Infinity;

    // Check distance to each point in the route (OSRM points are very dense)
    for (let i = 0; i < routeCoordinates.length; i++) {
      const [routeLat, routeLng] = routeCoordinates[i];
      const dist = getDistance(hazard.latitude, hazard.longitude, routeLat, routeLng);

      if (dist < minDistance) {
        minDistance = dist;
      }

      // Early break if we are already close enough
      if (dist < thresholdMeters) {
        break;
      }
    }

    if (minDistance < thresholdMeters) {
      hazardsOnRoute.push({
        ...hazard,
        distanceToRoute: minDistance
      });
    }
  });

  return hazardsOnRoute;
}

/**
 * Fetches routing alternatives from OSRM API
 * @param {Object} start - { lat, lng }
 * @param {Object} end - { lat, lng }
 * @returns {Promise<Array>} List of route alternatives with hazard analysis
 */
export async function getRouteAlternatives(start, end, activeHazards = []) {
  try {
    // Format: lon,lat;lon,lat
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    // Process and format each route option
    const processedRoutes = data.routes.map((route, index) => {
      // OSRM returns coordinates as [lon, lat], Leaflet wants [lat, lon]
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

      // Analyze hazards on this route
      const hazardsOnRoute = findHazardsOnRoute(coordinates, activeHazards);

      // Calculate a hazard score: Critical=10, High=5, Medium=2, Low=1
      const hazardScore = hazardsOnRoute.reduce((sum, h) => {
        const level = (h.hazard_level || 'medium').toLowerCase();
        if (level === 'critical') return sum + 10;
        if (level === 'high') return sum + 5;
        if (level === 'medium') return sum + 2;
        return sum + 1;
      }, 0);

      return {
        id: `route-${index}`,
        name: index === 0 ? 'Rute Utama' : `Rute Alternatif ${index}`,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        coordinates: coordinates,
        hazards: hazardsOnRoute,
        hazardScore: hazardScore,
        isSafe: hazardsOnRoute.length === 0
      };
    });

    // Sort routes: Safest first (hazard score ascending), then fastest (duration ascending)
    processedRoutes.sort((a, b) => {
      if (a.hazardScore !== b.hazardScore) {
        return a.hazardScore - b.hazardScore;
      }
      return a.duration - b.duration;
    });

    return processedRoutes;
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    throw error;
  }
}