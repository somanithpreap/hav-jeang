import { useState, useEffect } from "react";
import { mockMechanics } from "@/data/mockData";

/**
 * 🔧 useMechanics Hook
 *
 * Manages mechanics data with real-time filtering by search query and category.
 * Automatically loads mock data and provides filtered/available mechanics lists.
 *
 * @param {string} searchQuery - Search text to filter mechanics by name/location/services
 * @param {string} selectedCategory - Category ID to filter (or 'all' for no filter)
 *
 * @returns {Object} Mechanics data and loading state
 * @property {Array} mechanics - All mechanics (unfiltered)
 * @property {Array} filteredMechanics - Filtered by search + category
 * @property {Array} availableMechanics - Only available mechanics from filtered list
 * @property {boolean} isLoading - Loading state for initial data fetch
 *
 * @example
 * const { filteredMechanics, isLoading } = useMechanics(searchQuery, 'tire');
 */
export const useMechanics = (searchQuery, selectedCategory) => {
  const [mechanics, setMechanics] = useState([]);
  const [filteredMechanics, setFilteredMechanics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize mechanics on mount
  useEffect(() => {
    setTimeout(() => {
      setMechanics(mockMechanics);
      setFilteredMechanics(mockMechanics);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter mechanics based on search and category
  useEffect(() => {
    let filtered = mechanics;

    if (selectedCategory !== "all" && selectedCategory) {
      filtered = filtered.filter((m) => m.services.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.services.some((s) => s.toLowerCase().includes(query)) ||
          m.location.toLowerCase().includes(query)
      );
    }

    setFilteredMechanics(filtered);
  }, [searchQuery, selectedCategory, mechanics]);

  const availableMechanics = filteredMechanics.filter((m) => m.available);

  return {
    mechanics,
    filteredMechanics,
    availableMechanics,
    isLoading,
  };
};
