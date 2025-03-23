import type {
  Vehicle,
  TrafficSegment,
  PassengerData,
  WeatherData,
  EventData,
  RouteData,
  OptimizationResult,
} from "./types"
import { SmartTransitOptimizer } from "./ai-models"

// City center coordinates (Panvel, India)
const CITY_CENTER = {
  lat: 19.0289,
  lng: 73.1095,
}

// Create routes that radiate from the city center
const ROUTES = [
  { id: "42", name: "Panvel Station Express", color: "#3b82f6" }, // blue
  { id: "15", name: "Kamothe Line", color: "#ef4444" }, // red
  { id: "7", name: "Kharghar Circuit", color: "#22c55e" }, // green
  { id: "33", name: "New Panvel Shuttle", color: "#f59e0b" }, // amber
  { id: "21", name: "Kalamboli Connector", color: "#8b5cf6" }, // purple
  { id: "9", name: "Taloja Industrial Express", color: "#ec4899" }, // pink
]

// Define stations for each route
const STATIONS = {
  "42": ["Panvel Station", "Sector 10", "City Center", "Palm Beach", "CBD Belapur"],
  "15": ["Panvel Station", "Kharghar Hills", "Kharghar Station", "Utsav Chowk", "Kamothe"],
  "7": ["Panvel Station", "Orion Mall", "CIDCO Exhibition", "D-Mart Circle", "Kharghar"],
  "33": ["New Panvel", "Kalamboli Circle", "Central Park", "Panvel Station"],
  "21": ["Kalamboli", "Taloja MIDC", "Panvel Station", "Kamothe", "JNPT Road"],
  "9": ["Panvel Station", "Taloja", "Taloja MIDC", "Navi Mumbai SEZ"],
}

// Generate route paths (simplified for demo)
const generateRoutePath = (routeId: string): [number, number][] => {
  const paths: Record<string, [number, number][]> = {
    "42": [
      // Downtown Express - North-South route
      [CITY_CENTER.lat + 0.05, CITY_CENTER.lng],
      [CITY_CENTER.lat + 0.03, CITY_CENTER.lng + 0.01],
      [CITY_CENTER.lat, CITY_CENTER.lng],
      [CITY_CENTER.lat - 0.03, CITY_CENTER.lng - 0.01],
      [CITY_CENTER.lat - 0.05, CITY_CENTER.lng],
    ],
    "15": [
      // University Line - Northeast route
      [CITY_CENTER.lat, CITY_CENTER.lng],
      [CITY_CENTER.lat + 0.02, CITY_CENTER.lng + 0.02],
      [CITY_CENTER.lat + 0.04, CITY_CENTER.lng + 0.04],
      [CITY_CENTER.lat + 0.06, CITY_CENTER.lng + 0.06],
    ],
    "7": [
      // Riverside Circuit - Circular route
      [CITY_CENTER.lat, CITY_CENTER.lng],
      [CITY_CENTER.lat + 0.02, CITY_CENTER.lng + 0.03],
      [CITY_CENTER.lat, CITY_CENTER.lng + 0.05],
      [CITY_CENTER.lat - 0.02, CITY_CENTER.lng + 0.03],
      [CITY_CENTER.lat - 0.03, CITY_CENTER.lng],
      [CITY_CENTER.lat - 0.02, CITY_CENTER.lng - 0.03],
      [CITY_CENTER.lat, CITY_CENTER.lng - 0.05],
      [CITY_CENTER.lat + 0.02, CITY_CENTER.lng - 0.03],
      [CITY_CENTER.lat, CITY_CENTER.lng],
    ],
    "33": [
      // Airport Shuttle - East route
      [CITY_CENTER.lat, CITY_CENTER.lng],
      [CITY_CENTER.lat - 0.01, CITY_CENTER.lng + 0.03],
      [CITY_CENTER.lat - 0.02, CITY_CENTER.lng + 0.06],
      [CITY_CENTER.lat - 0.03, CITY_CENTER.lng + 0.09],
    ],
    "21": [
      // East-West Connector
      [CITY_CENTER.lat, CITY_CENTER.lng - 0.08],
      [CITY_CENTER.lat, CITY_CENTER.lng - 0.04],
      [CITY_CENTER.lat, CITY_CENTER.lng],
      [CITY_CENTER.lat, CITY_CENTER.lng + 0.04],
      [CITY_CENTER.lat, CITY_CENTER.lng + 0.08],
    ],
    "9": [
      // Industrial Zone Express - Southeast route
      [CITY_CENTER.lat, CITY_CENTER.lng],
      [CITY_CENTER.lat - 0.02, CITY_CENTER.lng + 0.02],
      [CITY_CENTER.lat - 0.04, CITY_CENTER.lng + 0.04],
      [CITY_CENTER.lat - 0.06, CITY_CENTER.lng + 0.06],
    ],
  }

  return paths[routeId] || []
}

// Generate alternative route paths for diversions
const generateDivertedRoutePath = (routeId: string): [number, number][] => {
  const paths: Record<string, [number, number][]> = {
    "42": [
      // Diverted Downtown Express
      [CITY_CENTER.lat + 0.03, CITY_CENTER.lng + 0.01], // Start diversion
      [CITY_CENTER.lat + 0.02, CITY_CENTER.lng + 0.015],
      [CITY_CENTER.lat + 0.01, CITY_CENTER.lng + 0.02],
      [CITY_CENTER.lat, CITY_CENTER.lng + 0.01],
      [CITY_CENTER.lat - 0.01, CITY_CENTER.lng],
      [CITY_CENTER.lat - 0.03, CITY_CENTER.lng - 0.01], // Rejoin original
    ],
    "15": [
      // Diverted University Line
      [CITY_CENTER.lat + 0.02, CITY_CENTER.lng + 0.02], // Start diversion
      [CITY_CENTER.lat + 0.025, CITY_CENTER.lng + 0.03],
      [CITY_CENTER.lat + 0.03, CITY_CENTER.lng + 0.035],
      [CITY_CENTER.lat + 0.035, CITY_CENTER.lng + 0.04],
      [CITY_CENTER.lat + 0.04, CITY_CENTER.lng + 0.04], // Rejoin original
    ],
  }

  return paths[routeId] || []
}

// Generate traffic segments based on route paths
const generateTrafficSegments = (): TrafficSegment[] => {
  const segments: TrafficSegment[] = []

  ROUTES.forEach((route) => {
    const path = generateRoutePath(route.id)

    // Create segments from path points
    for (let i = 0; i < path.length - 1; i++) {
      const segmentId = `${route.id}-segment-${i}`
      const congestionLevel = Math.random() // Random congestion level

      segments.push({
        id: segmentId,
        name: `${route.name} Segment ${i + 1}`,
        congestionLevel,
        averageSpeed: Math.max(5, 60 - congestionLevel * 55), // Speed decreases with congestion
        coordinates: [path[i], path[i + 1]],
        routeId: route.id,
      })
    }
  })

  return segments
}

// Determine if a route should be diverted based on traffic
const shouldDivertRoute = (routeId: string, trafficSegments: TrafficSegment[]): boolean => {
  // Find segments for this route
  const routeSegments = trafficSegments.filter(segment => segment.routeId === routeId);
  
  // Check if any segment has high congestion
  const hasHighCongestion = routeSegments.some(segment => segment.congestionLevel > 0.7);
  
  // Only certain routes have diversion options in this demo
  const hasDiversionOption = ["15", "42"].includes(routeId);
  
  return hasHighCongestion && hasDiversionOption;
}

// Generate simulated vehicles
const generateVehicles = (): Vehicle[] => {
  const vehicles: Vehicle[] = []
  const trafficSegments = generateTrafficSegments()
  
  // Create vehicles for each route
  ROUTES.forEach((route) => {
    const routePath = generateRoutePath(route.id)
    const shouldDivert = shouldDivertRoute(route.id, trafficSegments);
    const divertedPath = shouldDivert ? generateDivertedRoutePath(route.id) : [];
    
    // Number of vehicles per route
    const vehicleCount = 3 + Math.floor(Math.random() * 3) // 3-5 vehicles per route

    for (let i = 0; i < vehicleCount; i++) {
      const id = `${route.id}-${i + 1}`
      
      // Choose a random position along the route path
      const pathIndex = Math.floor(Math.random() * (routePath.length - 1))
      const [startLat, startLng] = routePath[pathIndex]
      const [endLat, endLng] = routePath[pathIndex + 1]
      
      // Interpolate between points for more variety
      const progress = Math.random()
      const lat = startLat + (endLat - startLat) * progress
      const lng = startLng + (endLng - startLng) * progress
      
      // Status weighted by congestion
      const routeSegments = trafficSegments.filter(seg => seg.routeId === route.id)
      const avgCongestion = routeSegments.reduce((sum, seg) => sum + seg.congestionLevel, 0) / Math.max(1, routeSegments.length)
      
      // More congestion = more "delayed" vehicles
      const statusWeights = [
        avgCongestion < 0.4 ? 0.9 : avgCongestion < 0.7 ? 0.6 : 0.3, // on-time
        avgCongestion < 0.4 ? 0.1 : avgCongestion < 0.7 ? 0.4 : 0.7, // delayed
      ]
      
      const status = weightedRandom(["on-time", "delayed"], statusWeights)
      
      // Generate additional vehicle data
      const passengerCapacity = 40 + Math.floor(Math.random() * 20) // 40-60 capacity
      const passengerCount = Math.floor(Math.random() * passengerCapacity)
      
      // Get the next and current stop for this bus
      const routeStations = STATIONS[route.id] || [];
      const currentStopIndex = Math.floor(Math.random() * Math.max(1, routeStations.length - 1));
      const nextStopIndex = (currentStopIndex + 1) % routeStations.length;
      
      // If vehicle is diverted, adjust next stop
      const currentStop = routeStations[currentStopIndex] || "Unknown";
      const nextStop = routeStations[nextStopIndex] || "Unknown";
      
      vehicles.push({
        id,
        routeId: route.id,
        route: route.name,
        latitude: lat,
        longitude: lng,
        speed: Math.max(5, 60 - avgCongestion * 50), // Speed decreases with congestion
        heading: Math.random() * 360,
        status,
        passengers: passengerCount,
        passengerCount,
        capacity: passengerCapacity,
        fuelLevel: 10 + Math.floor(Math.random() * 90), // 10-100%
        eta: 3 + Math.floor(Math.random() * 28), // 3-30 minutes
        currentStop,
        nextStop,
        routePath: true, // Flag that this vehicle has a route path
        diverted: shouldDivert, // Flag if this vehicle is on a diverted route
      })
    }
  })

  return vehicles
}

function weightedRandom<T>(options: T[], weights: number[]): T {
  const cumulativeWeights: number[] = []
  let sum = 0
  
  // Calculate cumulative weights
  for (const weight of weights) {
    sum += weight
    cumulativeWeights.push(sum)
  }
  
  // Get random value within total weight range
  const random = Math.random() * sum
  
  // Find the index of the selected option
  return options[cumulativeWeights.findIndex(w => random < w)]
}

const generatePassengerData = (): PassengerData => {
  return {
    totalPassengers: 2500 + Math.floor(Math.random() * 1500), // 2500-4000 total passengers
    passengersByRoute: ROUTES.map((route) => ({
      routeId: route.id,
      routeName: route.name,
      passengerCount: 300 + Math.floor(Math.random() * 500), // 300-800 per route
    })),
    passengersByHour: Array.from({ length: 24 }, (_, hour) => {
      // Model morning and evening rush hours
      let multiplier = 1
      if (hour >= 7 && hour <= 9) multiplier = 3 // Morning rush
      else if (hour >= 16 && hour <= 19) multiplier = 2.5 // Evening rush
      else if (hour >= 22 || hour <= 5) multiplier = 0.2 // Late night / early morning
      
      return {
        hour,
        passengerCount: Math.floor(100 * multiplier + Math.random() * 50 * multiplier),
      }
    }),
    averageRideDistance: 3 + Math.random() * 5, // 3-8 km
    averageRideTime: 15 + Math.random() * 20, // 15-35 minutes
  }
}

// Function to get weather conditions
const getWeatherConditions = (): WeatherData => {
  const conditions = ["clear", "cloudy", "rain", "heavy_rain"]
  const weights = [0.5, 0.3, 0.15, 0.05] // Weighted probability of each condition
  
  const condition = weightedRandom(conditions, weights)
  const temperature = 25 + Math.random() * 10 - 5 // 20-30°C
  
  // Visibility based on conditions
  let visibility: number
  switch (condition) {
    case "clear": visibility = 0.9 + Math.random() * 0.1; break // 90-100%
    case "cloudy": visibility = 0.7 + Math.random() * 0.2; break // 70-90%
    case "rain": visibility = 0.5 + Math.random() * 0.2; break // 50-70%
    case "heavy_rain": visibility = 0.3 + Math.random() * 0.2; break // 30-50%
    default: visibility = 1
  }
  
  return {
    condition,
    temperature,
    visibility,
    windSpeed: Math.random() * 30, // 0-30 km/h
    humidity: 40 + Math.random() * 50, // 40-90%
    precipitationChance: condition === "clear" ? 0 : condition === "cloudy" ? 0.2 : 0.8,
  }
}

// Simulated API calls

export async function fetchVehicleLocations(): Promise<Vehicle[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
  return generateVehicles()
}

export async function fetchTrafficData(): Promise<TrafficSegment[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
  return generateTrafficSegments()
}

export async function fetchPassengerData(): Promise<PassengerData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
  return generatePassengerData()
}

export async function fetchWeatherData(): Promise<WeatherData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
  return getWeatherConditions()
}

// Function to generate random events for the simulation
export async function fetchEventsData(): Promise<EventData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
  
  // City locations
  const locations = [
    { name: "Panvel Station", coordinates: [CITY_CENTER.lat, CITY_CENTER.lng] },
    { name: "Kamothe", coordinates: [CITY_CENTER.lat + 0.04, CITY_CENTER.lng + 0.04] },
    { name: "Kharghar", coordinates: [CITY_CENTER.lat + 0.06, CITY_CENTER.lng + 0.06] },
    { name: "CBD Belapur", coordinates: [CITY_CENTER.lat - 0.05, CITY_CENTER.lng] },
    { name: "New Panvel", coordinates: [CITY_CENTER.lat - 0.02, CITY_CENTER.lng + 0.06] },
  ]
  
  // Event types with impact on traffic
  const eventTypes = [
    { type: "concert", impact: 0.7 }, // High impact
    { type: "sports", impact: 0.6 }, // Medium-high impact
    { type: "festival", impact: 0.5 }, // Medium impact
    { type: "construction", impact: 0.4 }, // Medium-low impact
    { type: "roadwork", impact: 0.3 }, // Low impact
  ]
  
  // Create random events
  const eventCount = 1 + Math.floor(Math.random() * 3) // 1-3 events
  const events: EventData[] = []
  
  for (let i = 0; i < eventCount; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    events.push({
      id: `event-${i + 1}`,
      name: `${location.name} ${eventType.type.charAt(0).toUpperCase() + eventType.type.slice(1)}`,
      location: location.name,
      coordinates: location.coordinates,
      trafficImpact: eventType.impact + Math.random() * 0.2 - 0.1, // Add some randomness
      startTime: new Date(new Date().getTime() + Math.random() * 1000 * 60 * 60 * 24), // Within next 24 hours
      endTime: new Date(new Date().getTime() + Math.random() * 1000 * 60 * 60 * 48), // Within next 48 hours
      attendees: 100 + Math.floor(Math.random() * 9900), // 100-10000 attendees
      type: eventType.type,
    })
  }
  
  return events
}

// Function to get route data
export async function fetchRouteData(): Promise<RouteData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
  
  // Generate route data
  const routeData: RouteData[] = []
  const trafficSegments = generateTrafficSegments()
  
  ROUTES.forEach((route) => {
    // Get segments for this route
    const segments = trafficSegments.filter((segment) => segment.routeId === route.id)
    
    // Calculate average congestion for the route
    const totalCongestion = segments.reduce((sum, segment) => sum + segment.congestionLevel, 0)
    const avgCongestion = segments.length ? totalCongestion / segments.length : 0
    
    // Classify congestion level
    let congestionLevel: "low" | "medium" | "high" = "low"
    if (avgCongestion > 0.7) congestionLevel = "high"
    else if (avgCongestion > 0.4) congestionLevel = "medium"
    
    // Get the route path
    const path = generateRoutePath(route.id)
    
    // Generate random passenger counts for this route
    const averagePassengers = 200 + Math.floor(Math.random() * 300) // 200-500 average
    
    // Get diversion status
    const shouldDivert = shouldDivertRoute(route.id, trafficSegments);
    const divertedPath = shouldDivert ? generateDivertedRoutePath(route.id) : [];
    
    routeData.push({
      id: route.id,
      name: route.name,
      stations: STATIONS[route.id] || [],
      congestionLevel,
      averageCongestion: avgCongestion,
      currentPassengers: Math.floor(averagePassengers * (1 + Math.random() * 0.5 - 0.25)), // +/- 25%
      averagePassengers,
      frequency: 10 + Math.floor(Math.random() * 20), // 10-30 minute frequency
      routeColor: route.color,
      path,
      diverted: shouldDivert,
      divertedPath,
      diversionReason: shouldDivert ? "High traffic congestion" : undefined,
    })
  })
  
  return routeData
}

// Function to generate optimization recommendations
export async function generateOptimizationRecommendations(): Promise<OptimizationResult[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500))
  
  const routeData = await fetchRouteData()
  const trafficSegments = await fetchTrafficData()
  
  // Generate recommendations for each route
  const recommendations: OptimizationResult[] = []
  
  routeData.forEach((route) => {
    const { id, name, averageCongestion, frequency } = route
    
    // Only generate recommendations for routes with specific issues
    if (averageCongestion > 0.4 || (id === "15" || id === "42")) {
      // Define optimization type based on conditions
      let optimizationType: "diversion" | "frequency" = Math.random() > 0.5 ? "diversion" : "frequency"
      let priority: "low" | "medium" | "high" = "medium"
      
      // Force specific recommendation types for specific routes
      if (id === "15") optimizationType = "diversion"
      if (id === "42") optimizationType = "frequency"
      
      // Prioritize based on congestion
      if (averageCongestion > 0.7) priority = "high"
      else if (averageCongestion < 0.4) priority = "low"
      
      const originalRoute = `${STATIONS[id]?.[0] || 'Start'} → ${STATIONS[id]?.[STATIONS[id]?.length - 1 || 0] || 'End'}`
      let optimizedRoute = originalRoute
      let reason = ""
      let confidence = 75 + Math.floor(Math.random() * 21) // 75-95% confidence
      
      // Customize recommendation based on type
      if (optimizationType === "diversion") {
        // Generate diversion recommendation
        const congestionLocation = STATIONS[id]?.[Math.floor(Math.random() * (STATIONS[id]?.length || 1))] || "location"
        reason = `High traffic congestion near ${congestionLocation}`
        
        // Create diversion path description
        const alternateRoute = [...(STATIONS[id] || [])]
        if (alternateRoute.length > 3) {
          const insertIndex = Math.floor(alternateRoute.length / 2)
          alternateRoute.splice(insertIndex, 0, "Palm Beach Road") // Insert diversion point
          optimizedRoute = `${alternateRoute[0]} → ${alternateRoute[insertIndex]} → ${alternateRoute[alternateRoute.length - 1]}`
        }
      } else {
        // Generate frequency recommendation
        const frequencyChange = averageCongestion > 0.6 ? 
          Math.floor(frequency * 0.7) : // Increase frequency (lower minutes between buses)
          Math.floor(frequency * 1.3)   // Decrease frequency
          
        reason = averageCongestion > 0.6 ?
          `High passenger demand exceeding capacity` :
          `Low utilization on this route`
          
        optimizedRoute = originalRoute // Same route, just different frequency
      }
      
      // Generate impact data
      const travelTimeReduction = 5 + Math.floor(Math.random() * 16) // 5-20 minutes saved
      const waitTimeReduction = 3 + Math.floor(Math.random() * 8) // 3-10 minutes saved
      const fuelSavings = 100 + Math.floor(Math.random() * 400) // ₹100-500 saved
      
      recommendations.push({
        routeId: id,
        route: name,
        priority,
        originalRoute,
        optimizedRoute,
        reason,
        confidence,
        impact: {
          travelTimeReduction,
          waitTimeReduction,
          fuelSavings,
        },
        type: optimizationType,
      })
    }
  })
  
  return recommendations
}

