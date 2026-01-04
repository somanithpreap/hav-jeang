import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  MapPin, 
  Navigation2, 
  Star, 
  Wrench,
  History,
  Bookmark,
  MapIcon,
  WifiOff,
  MapPinOff,
  X,
  Phone,
  Clock,
  Zap,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Battery,
  Disc,
  AlertOctagon,
  Send,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * 🏗️ Hav Jeang – Customer Home Page
 * 
 * Product Goal: Allow customers to discover and request mechanic services in <5 seconds
 * Design Philosophy: Map-first, emergency-ready, minimal cognitive load
 * 
 * Complete Service Request Workflow:
 * 1. Customer selects mechanic from map/list
 * 2. Customer specifies service needs or describes issue
 * 3. Trip fee calculated based on distance
 * 4. Mechanic notified in real-time
 * 5. Mechanic accepts/denies request
 * 6. Customer notified of acceptance
 * 7. Status tracking (accepted → departure → arrival → servicing)
 * 8. Mechanic assesses & proposes service fee (on-site)
 * 9. Customer accepts/denies fee proposal
 * 10. Grand total calculated after service
 * 
 * Key Principles:
 * ✅ 80% map visibility
 * ✅ Icon-based UI (Lucide icons)
 * ✅ Minimal shadows, flat design
 * ✅ Emergency-first service categories
 * ✅ 2-state bottom sheet (collapsed/expanded)
 * ✅ Outdoor-readable contrast
 * ✅ Khmer + English typography
 * ✅ Graceful degradation (GPS denied, offline, no mechanics)
 * 
 * Target: Mid-range smartphones, unstable internet, stressed users
 */
const CustomerHome = () => {
  // State Management
  const [mechanics, setMechanics] = useState([]);
  const [filteredMechanics, setFilteredMechanics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('emergency');
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [showServiceRequest, setShowServiceRequest] = useState(false); // Service request modal
  const [serviceDescription, setServiceDescription] = useState(''); // Issue description
  const [selectedServices, setSelectedServices] = useState([]); // Selected service types
  const [calculatedTripFee, setCalculatedTripFee] = useState(0); // Trip fee based on distance
  const [bottomSheetState, setBottomSheetState] = useState('collapsed'); // 'collapsed', 'expanded'
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending'); // 'granted', 'denied', 'pending'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('explore');
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([11.5564, 104.9282]); // [lat, lng] for Leaflet
  const [mapZoom, setMapZoom] = useState(14);
  const bottomSheetRef = useRef(null);
  const dragStartY = useRef(0);
  const mapRef = useRef(null);

  // Custom Leaflet icons (wrench icon, flat design, minimal)
  const createCustomIcon = (available) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative cursor-pointer">
          <div class="w-11 h-11 rounded-full border-2 ${available ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-gray-400'} flex items-center justify-center transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          ${available ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>' : ''}
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
    });
  };

  const userLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="relative">
        <div class="w-4 h-4 bg-blue-600 rounded-full border-3 border-white relative z-10"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-blue-400/20 rounded-full"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  // Map center update component
  const MapCenterUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, zoom);
      }
    }, [center, zoom, map]);
    return null;
  };

  // Service Categories (Emergency-first, icon-based)
  const categories = [
    { id: 'emergency', label: 'Emergency', icon: AlertOctagon, color: 'red' },
    { id: 'tire', label: 'Tire', icon: Disc, color: 'blue' },
    { id: 'battery', label: 'Battery', icon: Battery, color: 'yellow' },
    { id: 'engine', label: 'Engine', icon: Zap, color: 'orange' },
    { id: 'brake', label: 'Brake', icon: TrendingUp, color: 'purple' },
  ];

  // Available service types for customer selection
  const serviceTypes = [
    { id: 'tire', label: 'Tire Repair/Replace', icon: Disc },
    { id: 'battery', label: 'Battery Jump/Replace', icon: Battery },
    { id: 'engine', label: 'Engine Diagnosis', icon: Zap },
    { id: 'brake', label: 'Brake Service', icon: TrendingUp },
    { id: 'emergency', label: 'Emergency Roadside', icon: AlertOctagon },
    { id: 'other', label: 'Other (Describe below)', icon: Wrench },
  ];

  // Mock Mechanic Data with Real Cambodia Locations
  const mockMechanics = [
    {
      id: 1,
      name: 'Sok Piseth Auto Repair',
      rating: 4.8,
      totalReviews: 127,
      distance: 0.8,
      available: true,
      lat: 11.5564,
      lng: 104.9282,
      services: ['tire', 'engine', 'brake'],
      vehicleType: ['Car', 'Moto'],
      responseTime: '~5 min',
      workHours: '08:00 - 18:00',
      phone: '+855 12 345 678',
      location: 'Daun Penh, Phnom Penh',
      baseTripFee: 2.00 // USD per km
    },
    {
      id: 2,
      name: 'Chea Mechanic Workshop',
      rating: 4.6,
      totalReviews: 89,
      distance: 1.2,
      available: true,
      lat: 11.5449,
      lng: 104.9220,
      services: ['battery', 'emergency', 'engine'],
      vehicleType: ['Car'],
      responseTime: '~10 min',
      workHours: '07:00 - 19:00',
      phone: '+855 12 876 543',
      location: 'Toul Kork, Phnom Penh',
      baseTripFee: 2.00
    },
    {
      id: 3,
      name: 'Vann Auto Service Center',
      rating: 4.9,
      totalReviews: 203,
      distance: 2.5,
      available: false,
      lat: 11.5334,
      lng: 104.9144,
      services: ['tire', 'brake', 'engine'],
      vehicleType: ['Car', 'Moto', 'Truck'],
      responseTime: 'Unavailable',
      workHours: '08:00 - 17:00',
      phone: '+855 12 234 567',
      location: 'Chamkar Mon, Phnom Penh',
      baseTripFee: 2.00
    },
    {
      id: 4,
      name: 'Rapid Moto Repair',
      rating: 4.7,
      totalReviews: 156,
      distance: 0.5,
      available: true,
      lat: 11.5650,
      lng: 104.9150,
      services: ['emergency', 'tire', 'battery'],
      vehicleType: ['Moto'],
      responseTime: '~3 min',
      workHours: '24/7',
      phone: '+855 12 456 789',
      location: 'Russey Keo, Phnom Penh',
      baseTripFee: 1.50
    },
    {
      id: 5,
      name: 'Professional Car Care',
      rating: 4.5,
      totalReviews: 95,
      distance: 1.8,
      available: true,
      lat: 11.5520,
      lng: 104.9350,
      services: ['brake', 'engine', 'tire'],
      vehicleType: ['Car', 'SUV'],
      responseTime: '~8 min',
      workHours: '08:00 - 18:00',
      phone: '+855 12 567 890',
      location: 'Tuol Kouk, Phnom Penh',
      baseTripFee: 2.00
    },
    {
      id: 6,
      name: 'Quick Fix Auto Shop',
      rating: 4.4,
      totalReviews: 73,
      distance: 2.1,
      available: true,
      lat: 11.5280,
      lng: 104.9200,
      services: ['battery', 'tire', 'emergency'],
      vehicleType: ['Car', 'Moto'],
      responseTime: '~12 min',
      workHours: '07:00 - 20:00',
      phone: '+855 12 678 901',
      location: 'Mean Chey, Phnom Penh',
      baseTripFee: 2.00
    },
  ];

  // Initialize mechanics on mount
  useEffect(() => {
    setTimeout(() => {
      setMechanics(mockMechanics);
      setFilteredMechanics(mockMechanics);
      setIsLoading(false);
    }, 800);
  }, []);

  // Request GPS Location (iOS compatible)
  useEffect(() => {
    const requestLocation = () => {
      if ('geolocation' in navigator) {
        // iOS requires higher timeout and enableHighAccuracy for better results
        const options = {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0 // Don't use cached position
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = [position.coords.latitude, position.coords.longitude];
            setUserLocation(userPos);
            setMapCenter(userPos);
            setLocationPermission('granted');
            console.log('Location obtained:', userPos);
          },
          (error) => {
            console.error('Location error:', error.code, error.message);
            
            // Different error handling for iOS
            if (error.code === 1) {
              // Permission denied
              console.log('Location permission denied by user');
            } else if (error.code === 2) {
              // Position unavailable
              console.log('Location unavailable');
            } else if (error.code === 3) {
              // Timeout
              console.log('Location request timeout');
            }
            
            setLocationPermission('denied');
            const fallbackPos = [11.5564, 104.9282];
            setUserLocation(fallbackPos);
            setMapCenter(fallbackPos);
          },
          options
        );
      } else {
        console.log('Geolocation not supported');
        setLocationPermission('denied');
        const fallbackPos = [11.5564, 104.9282];
        setUserLocation(fallbackPos);
        setMapCenter(fallbackPos);
      }
    };

    // Small delay to ensure proper iOS handling
    const timer = setTimeout(requestLocation, 100);
    return () => clearTimeout(timer);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filter mechanics based on search and category
  useEffect(() => {
    let filtered = mechanics;

    // Filter by category
    if (selectedCategory !== 'all' && selectedCategory) {
      filtered = filtered.filter(m => m.services.includes(selectedCategory));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.services.some(s => s.toLowerCase().includes(query)) ||
        m.location.toLowerCase().includes(query)
      );
    }

    setFilteredMechanics(filtered);
  }, [searchQuery, selectedCategory, mechanics]);

  // Calculate trip fee based on distance
  const calculateTripFee = (mechanic) => {
    const fee = mechanic.distance * mechanic.baseTripFee;
    return fee.toFixed(2);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle service type toggle
  const toggleServiceType = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Handle bottom sheet drag (2 states: collapsed/expanded)
  const handleDragStart = (e) => {
    const touch = e.type.includes('touch') ? e.touches[0] : e;
    dragStartY.current = touch.clientY;
  };

  const handleDragMove = (e) => {
    if (dragStartY.current === 0) return;
    
    const touch = e.type.includes('touch') ? e.touches[0] : e;
    const deltaY = dragStartY.current - touch.clientY;
    
    if (deltaY > 80 && bottomSheetState === 'collapsed') {
      setBottomSheetState('expanded');
      dragStartY.current = 0;
    } else if (deltaY < -80 && bottomSheetState === 'expanded') {
      setBottomSheetState('collapsed');
      dragStartY.current = 0;
    }
  };

  const handleDragEnd = () => {
    dragStartY.current = 0;
  };

  // Toggle bottom sheet (2 states)
  const toggleBottomSheet = () => {
    setBottomSheetState(bottomSheetState === 'collapsed' ? 'expanded' : 'collapsed');
  };

  // Calculate bottom sheet height (2 states)
  const getBottomSheetHeight = () => {
    switch (bottomSheetState) {
      case 'collapsed': return '140px';
      case 'expanded': return '80%';
      default: return '140px';
    }
  };

  // Handle mechanic selection and show service request modal
  const handleMechanicSelect = (mechanic) => {
    setSelectedMechanic(mechanic);
    setShowServiceRequest(true);
    setCalculatedTripFee(calculateTripFee(mechanic));
    setMapCenter([mechanic.lat, mechanic.lng]);
    setMapZoom(15);
  };

  // Handle service request submission
  const handleRequestSubmit = () => {
    if (selectedServices.length === 0 && !serviceDescription.trim()) {
      alert('Please select a service or describe your issue');
      return;
    }

    // In production: Send request to backend API
    console.log('Service Request:', {
      mechanic: selectedMechanic,
      services: selectedServices,
      description: serviceDescription,
      tripFee: calculatedTripFee,
      customerLocation: userLocation,
    });

    // Close modal and reset
    setShowServiceRequest(false);
    setSelectedServices([]);
    setServiceDescription('');
    
    // Show confirmation
    alert(`Request sent to ${selectedMechanic.name}!\n\nTrip Fee: $${calculatedTripFee}\n\nYou'll be notified when the mechanic responds.`);
  };

  // Recenter map to user location
  const handleRecenter = useCallback(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
    }
  }, [userLocation]);

  // Retry location request (for iOS)
  const handleRetryLocation = () => {
    setLocationPermission('pending');
    setIsLoading(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);
          setMapCenter(userPos);
          setLocationPermission('granted');
          setIsLoading(false);
          console.log('Location retry successful:', userPos);
        },
        (error) => {
          console.error('Location retry failed:', error.code, error.message);
          setLocationPermission('denied');
          const fallbackPos = [11.5564, 104.9282];
          setUserLocation(fallbackPos);
          setMapCenter(fallbackPos);
          setIsLoading(false);
          
          // Show helpful message for iOS users
          alert(
            'Location access failed. Please:\n\n' +
            '1. Go to iPhone Settings\n' +
            '2. Find Safari (or your browser)\n' +
            '3. Enable Location Services\n' +
            '4. Reload this page'
          );
        },
        options
      );
    } else {
      setIsLoading(false);
      alert('Your device does not support location services.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    // Redirect to auth page
    window.location.href = '/auth';
  };

  const availableMechanics = filteredMechanics.filter(m => m.available);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50 safe-area-inset">
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-bold">No internet connection</span>
        </div>
      )}

      {/* Full-Screen Map Container (80% height) */}
      <div className="absolute inset-0 z-0">
        {isLoading ? (
          // Loading State
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center px-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-900 mb-1">Finding mechanics...</p>
              <p className="text-sm text-gray-600">Scanning your area for available help</p>
            </div>
          </div>
        ) : locationPermission === 'denied' ? (
          // GPS Permission Denied State
          <div className="w-full h-full flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center max-w-sm">
              <MapPinOff className="w-20 h-20 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Location Required</h3>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                Enable location access to find nearby mechanics and get accurate distances.
              </p>
              <Button
                size="lg"
                onClick={handleRetryLocation}
                className="w-full"
              >
                Enable Location
              </Button>
              <p className="text-xs text-gray-500 mt-4 text-center">
                iOS users: Check Settings → Safari → Location Services
              </p>
            </div>
          </div>
        ) : (
          // Map View
          <MapContainer
            ref={mapRef}
            center={mapCenter}
            zoom={mapZoom}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
            
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon} />
            )}

            {filteredMechanics.map((mechanic) => (
              <Marker
                key={mechanic.id}
                position={[mechanic.lat, mechanic.lng]}
                icon={createCustomIcon(mechanic.available)}
                eventHandlers={{
                  click: () => mechanic.available && handleMechanicSelect(mechanic),
                }}
              />
            ))}
          </MapContainer>
        )}
      </div>

      {/* Floating Search Bar */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-safe pb-2 z-40 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-white rounded-2xl flex-1 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search mechanics or services"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 border-0 focus-visible:ring-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Logout Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleLogout}
            className="shadow-sm"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Emergency-First Service Categories */}
        <div className="mt-3 overflow-x-auto scrollbar-hide pointer-events-auto">
          <div className="flex gap-2 pb-1">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  variant={selectedCategory === category.id ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-shrink-0 shadow-sm"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recenter Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-4 bottom-[180px] z-40 shadow-sm"
        onClick={handleRecenter}
        aria-label="Recenter map"
      >
        <Navigation2 className="w-5 h-5 text-primary" />
      </Button>

      {/* Service Request Modal */}
      {showServiceRequest && selectedMechanic && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowServiceRequest(false)}>
          <div 
            className="bg-white rounded-t-3xl w-full max-h-[90%] overflow-y-auto animate-slideUp safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Request Service</h2>
                <button 
                  onClick={() => setShowServiceRequest(false)}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Mechanic Info */}
              <Card className="shadow-none border-0 bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{selectedMechanic.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{selectedMechanic.distance} km away</span>
                        <span>•</span>
                        <span className="text-green-700 font-semibold">{selectedMechanic.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trip Fee */}
              <div className="mt-3 bg-blue-50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Trip Fee</span>
                </div>
                <span className="text-xl font-bold text-blue-600">${calculatedTripFee}</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-5 py-6">
              {/* Service Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  What service do you need?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {serviceTypes.map((service) => {
                    const IconComponent = service.icon;
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <Button
                        key={service.id}
                        onClick={() => toggleServiceType(service.id)}
                        variant={isSelected ? 'default' : 'secondary'}
                        className="w-full justify-start h-auto py-3"
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs">{service.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Issue Description */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Describe your issue (optional)
                </label>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="e.g., Car won't start, strange noise from engine..."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:bg-white transition-all resize-none text-sm"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleRequestSubmit}
                size="lg"
                className="w-full"
              >
                <Send className="w-5 h-5" />
                Send Request to Mechanic
              </Button>

              {/* Info Note */}
              <div className="mt-4 bg-yellow-50 rounded-xl p-3">
                <p className="text-xs text-yellow-900 leading-relaxed">
                  <strong>Note:</strong> The mechanic will be notified in real-time. 
                  You'll receive a notification when they accept. Service fees will be 
                  assessed on-site after diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Bottom Sheet */}
      <div
        ref={bottomSheetRef}
        className="absolute left-0 right-0 bg-white border-t-2 border-gray-200 transition-all duration-300 ease-out z-40 safe-area-bottom"
        style={{ 
          bottom: 0, 
          height: getBottomSheetHeight(),
          touchAction: 'none'
        }}
      >
        {/* Drag Handle */}
        <div 
          className="py-4 cursor-grab active:cursor-grabbing"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onClick={toggleBottomSheet}
        >
          <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto"></div>
        </div>

        {/* Header */}
        <div className="px-5 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Nearby Mechanics</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{filteredMechanics.length} found</span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-green-700 font-semibold">{availableMechanics.length} available</span>
            </div>
          </div>
        </div>

        {/* Mechanics List */}
        <div className="overflow-y-auto px-5 py-4" style={{ height: 'calc(100% - 120px)' }}>
          {filteredMechanics.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No mechanics found</h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Try adjusting your search or clearing filters
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {filteredMechanics.map((mechanic) => (
                <Card
                  key={mechanic.id}
                  onClick={() => mechanic.available && handleMechanicSelect(mechanic)}
                  className={cn(
                    "transition-all shadow-sm",
                    mechanic.available 
                      ? 'hover:shadow-md cursor-pointer' 
                      : 'opacity-60 cursor-not-allowed'
                  )}
                >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Mechanic Avatar */}
                    <div className={cn(
                      "relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                      mechanic.available ? 'bg-green-600' : 'bg-gray-400'
                    )}>
                      <Wrench className="w-7 h-7 text-white" />
                      {mechanic.available && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 mr-2">
                          <h3 className="font-bold text-gray-900 truncate text-base mb-1">{mechanic.name}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                              <span className="font-semibold text-gray-900">{mechanic.rating}</span>
                              <span className="text-gray-500 text-xs">({mechanic.totalReviews})</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                              <span className="font-semibold">{mechanic.distance} km</span>
                            </div>
                          </div>
                        </div>
                        {mechanic.available && (
                          <Badge variant="success">Available</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{mechanic.workHours}</span>
                        {mechanic.available && (
                          <>
                            <span>•</span>
                            <span className="text-green-700 font-bold">{mechanic.responseTime}</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {mechanic.services.slice(0, 3).map((service) => (
                          <Badge key={service} variant="secondary" className="capitalize">
                            {service}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${mechanic.phone}`);
                          }}
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </Button>
                        <Button
                          variant={mechanic.available ? 'default' : 'secondary'}
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            mechanic.available && handleMechanicSelect(mechanic);
                          }}
                          disabled={!mechanic.available}
                        >
                          {mechanic.available ? (
                            <>
                              Request
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : (
                            'Unavailable'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-bottom">
        <div className="flex items-center justify-around px-4 py-3 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all active:scale-95 ${
              activeTab === 'explore' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <MapIcon className="w-6 h-6 mb-1" strokeWidth={2} />
            <span className="text-xs font-bold">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all active:scale-95 ${
              activeTab === 'history' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <History className="w-6 h-6 mb-1" strokeWidth={2} />
            <span className="text-xs font-bold">History</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all active:scale-95 ${
              activeTab === 'saved' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <Bookmark className="w-6 h-6 mb-1" strokeWidth={2} />
            <span className="text-xs font-bold">Saved</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
