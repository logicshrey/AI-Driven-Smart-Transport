// Define types for the application

export interface Vehicle {
  id: string
  routeId: string
  route: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  status: "on-time" | "delayed" | "out-of-service"
  passengers?: number
  passengerCount: number
  capacity: number
  fuelLevel: number
  eta: number
  currentStop: string
  nextStop: string
  routePath?: boolean
  diverted?: boolean
}

export interface TrafficSegment {
  id: string
  name: string
  congestionLevel: number // 0-1 value where 1 is most congested
  averageSpeed: number
  coordinates: [number, number][] // [lat, lng] points defining the segment
  routeId: string
}

export interface Incident {
  id: string
  type: "accident" | "construction" | "event" | "weather"
  severity: "low" | "medium" | "high"
  latitude: number
  longitude: number
  description: string
  startTime: Date
  estimatedEndTime?: Date
}

export interface PassengerData {
  totalPassengers: number
  passengersByRoute: {
    routeId: string
    routeName: string
    passengerCount: number
  }[]
  passengersByHour: {
    hour: number
    passengerCount: number
  }[]
  averageRideDistance: number
  averageRideTime: number
}

export interface WeatherData {
  condition: "clear" | "cloudy" | "rain" | "heavy_rain"
  temperature: number
  visibility: number // 0-1 value
  windSpeed: number
  humidity: number
  precipitationChance: number
}

export interface EventData {
  id: string
  name: string
  type: string
  location: string
  coordinates: [number, number]
  trafficImpact: number // 0-1 value
  startTime: Date
  endTime: Date
  attendees: number
}

export interface Recommendation {
  route: string
  recommendation: string
  impact: string
  priority: "low" | "medium" | "high"
  confidence?: number
  explanation?: string
}

export interface OptimizationResult {
  routeId: string
  route: string
  priority: "low" | "medium" | "high"
  originalRoute: string
  optimizedRoute: string
  reason: string
  confidence: number
  impact: {
    travelTimeReduction: number
    waitTimeReduction: number
    fuelSavings: number
  }
  type: "diversion" | "frequency"
}

export interface RouteData {
  id: string
  name: string
  stations: string[]
  congestionLevel: "low" | "medium" | "high"
  averageCongestion: number
  currentPassengers: number
  averagePassengers: number
  frequency: number // minutes between buses
  routeColor: string
  path: [number, number][] // Path coordinates
  diverted: boolean
  divertedPath?: [number, number][]
  diversionReason?: string
}

