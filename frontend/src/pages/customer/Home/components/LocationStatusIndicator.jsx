import { motion } from 'framer-motion';

/**
 * Minimal Location Status Indicator
 * 
 * Simple, clean indicator showing "Location: On" or "Location: Off"
 * Tappable when off to trigger system location permission
 * 
 * Design Principles:
 * - Minimal and non-intrusive
 * - Native mobile app feel
 * - Clear status indication
 * - Action-driven (tap to enable)
 * 
 * @param {Object} props
 * @param {string} props.permission - Location permission status ('granted', 'denied', 'pending')
 * @param {Function} props.onEnableLocation - Callback to request location
 * @param {boolean} props.isLoading - Whether location request is in progress
 */
export const LocationStatusIndicator = ({ permission, onEnableLocation, isLoading = false }) => {
  const isOn = permission === 'granted';

  // If location is on, show non-interactive status
  if (isOn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-40 safe-area-top"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-gray-100 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span className="text-xs font-medium text-gray-700">
            Location: <span className="text-green-600 font-semibold">On</span>
          </span>
        </div>
      </motion.div>
    );
  }

  // If location is off, show tappable status
  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={onEnableLocation}
      disabled={isLoading}
      className="fixed top-4 right-4 z-40 safe-area-top group"
      aria-label="Tap to enable location"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-gray-200 group-hover:border-gray-300 group-hover:shadow-lg transition-all flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        <span className="text-xs font-medium text-gray-700">
          Location: <span className="text-gray-500 font-semibold">{isLoading ? 'Enabling...' : 'Off'}</span>
        </span>
      </div>
    </motion.button>
  );
};
