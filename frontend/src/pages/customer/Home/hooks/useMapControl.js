import { useState, useRef, useCallback } from "react";

/**
 * 🗺️ useMapControl Hook
 * 
 * Manages Leaflet map state including center, zoom, and navigation.
 * Provides methods to focus on locations, mechanics, or recenter to user.
 * 
 * @param {Array<number>} initialCenter - Initial map center [lat, lng]
 * 
 * @returns {Object} Map control state and methods
 * @property {React.RefObject} mapRef - Ref to Leaflet map instance
 * @property {Array<number>} mapCenter - Current map center [lat, lng]
 * @property {number} mapZoom - Current zoom level (1-18)
 * @property {Function} focusOnLocation - Focus map on specific coordinates
 * @property {Function} focusOnMechanic - Focus map on mechanic's location
 * @property {Function} recenterToUser - Recenter map to user's current location
 * 
 * @example
 * const { mapRef, focusOnMechanic, recenterToUser } = useMapControl();
 * <button onClick={() => focusOnMechanic(mechanic)}>View on Map</button>
 */
export const useMapControl = (initialCenter = [11.5564, 104.9282]) => {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(14);
  const mapRef = useRef(null);

  const focusOnLocation = useCallback((location, zoom = 15) => {
    if (location) {
      setMapCenter(location);
      setMapZoom(zoom);
    }
  }, []);

  const focusOnMechanic = useCallback((mechanic) => {
    if (mechanic?.lat && mechanic?.lng) {
      setMapCenter([mechanic.lat, mechanic.lng]);
      setMapZoom(15);
    }
  }, []);

  const recenterToUser = useCallback(
    (userLocation) => {
      focusOnLocation(userLocation, 15);
    },
    [focusOnLocation]
  );

  return {
    mapRef,
    mapCenter,
    mapZoom,
    focusOnLocation,
    focusOnMechanic,
    recenterToUser,
  };
};
