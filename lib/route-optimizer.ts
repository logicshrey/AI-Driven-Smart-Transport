import type { Vehicle, TrafficSegment, RouteData, OptimizationResult } from "./types"

/**
 * A rule-based route optimizer that simulates AI/ML functionality
 * using predefined rules and thresholds instead of actual ML models
 */
export class RouteOptimizer {
  // Store historical traffic data (simplified simulation)
  private historicalTraffic: Record<string, number[]> = {}
  // Store passenger demand patterns (simplified simulation)
  private demandPatterns: Record<string, number[]> = {}
  // Deterministic random function for stable values
  private pseudoRandom(seed: number): number {
    // Simple deterministic pseudo-random number generator
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  
  constructor() {
    // Client-side only initialization
    if (typeof window !== 'undefined') {
      this.initializeDefaultPatterns()
    }
  }
  
  private initializeDefaultPatterns() {
    // Create simulated historical traffic patterns for each hour (0-23)
    // Higher values = more congestion (0-1 scale)
    const morningPeakPattern = [0.1, 0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 0.9, 0.8, 0.6, 0.5, 0.4, 0.5, 0.5, 0.5, 0.6, 0.7, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.1]
    const eveningPeakPattern = [0.1, 0.1, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 0.6, 0.5, 0.5, 0.5, 0.6, 0.7, 0.7, 0.8, 0.9, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1]
    const balancedPattern = [0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.7, 0.6, 0.6, 0.6, 0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.7, 0.5, 0.4, 0.3, 0.2, 0.1]
    
    // Assign different patterns to different routes
    const routePatterns = {
      "42": morningPeakPattern, // Panvel Station Express
      "15": eveningPeakPattern, // Kamothe Line
      "7": balancedPattern,     // Kharghar Circuit
      "33": eveningPeakPattern, // New Panvel Shuttle
      "21": morningPeakPattern, // Kalamboli Connector
      "9": balancedPattern,     // Taloja Industrial Express
    }
    
    // Initialize historical traffic and demand patterns
    Object.entries(routePatterns).forEach(([routeId, pattern], index) => {
      this.historicalTraffic[routeId] = pattern
      
      // Use deterministic values instead of random Math.random()
      this.demandPatterns[routeId] = pattern.map((value, i) => {
        const seed = parseInt(routeId) * 1000 + i;
        const variation = (this.pseudoRandom(seed) * 0.4 - 0.2);
        return Math.min(0.9, 0.3 + value * (0.7 + variation));
      })
    })
  }
  
  /**
   * Get current hour of day (0-23)
   * Only call this client-side to prevent hydration mismatches
   */
  private getCurrentHour(): number {
    if (typeof window === 'undefined') {
      return 12; // Default midday for server-side rendering
    }
    return new Date().getHours()
  }
  
  /**
   * Calculate frequency recommendation based on current demand
   */
  private getFrequencyRecommendation(routeId: string): string {
    const hour = this.getCurrentHour()
    const demandLevel = this.demandPatterns[routeId]?.[hour] || 0.5
    
    if (demandLevel > 0.8) return "5-8 minutes"
    if (demandLevel > 0.6) return "10-12 minutes"
    if (demandLevel > 0.4) return "15 minutes"
    return "20-30 minutes"
  }
  
  /**
   * Recommend route diversion based on traffic conditions
   */
  private getRouteDiversion(
    routeId: string, 
    currentTraffic: TrafficSegment[]
  ): { original: string; diverted: string } | null {
    // Get traffic segments for this route
    const routeSegments = currentTraffic.filter(segment => 
      segment.id.startsWith(`${routeId}-segment`)
    )
    
    // Check if any segment has high congestion
    const highCongestionSegments = routeSegments.filter(
      segment => segment.congestionLevel > 0.7
    )
    
    if (highCongestionSegments.length === 0) {
      return null // No diversion needed
    }
    
    // Simulate alternative routes based on route ID
    // In a real system, this would query a routing engine with actual road data
    const alternatives: Record<string, { original: string; diverted: string }> = {
      "42": {
        original: "Panvel Station → Panvel-Uran Rd → CBD → Main Rd → Sector 15",
        diverted: "Panvel Station → Old Panvel Rd → Kalamboli Circle → Sector 15",
      },
      "15": {
        original: "Kamothe → Sion-Panvel Hwy → Kharghar → CBD Belapur",
        diverted: "Kamothe → Palm Beach Rd → Nerul → CBD Belapur",
      },
      "7": {
        original: "Kharghar Station → Hiranandani → Central Park → Sector 10",
        diverted: "Kharghar Station → Sector 12 → Roadpali → Sector 10",
      },
      "33": {
        original: "New Panvel → Kalamboli → Kamothe → Kharghar",
        diverted: "New Panvel → Palaspa → Panvel Bypass → Kharghar",
      },
      "21": {
        original: "Kalamboli → Panvel Station → New Panvel → JNPT Road",
        diverted: "Kalamboli → Kamothe → Kalamboli Circle → JNPT Road",
      },
      "9": {
        original: "Taloja MIDC → Taloja Central → Panvel Station → Kalamboli",
        diverted: "Taloja MIDC → NH 4 → Palaspa → Kalamboli",
      },
    }
    
    return alternatives[routeId] || null
  }
  
  /**
   * Simulate GPS integration by enhancing vehicle data with additional properties
   */
  public enhanceVehicleData(vehicles: Vehicle[]): Vehicle[] {
    return vehicles.map((vehicle, index) => {
      // Use deterministic values instead of Math.random()
      const seed1 = parseInt(vehicle.id.replace(/\D/g, '') || '1') * 100;
      const seed2 = seed1 + 1;
      const seed3 = seed1 + 2;
      
      // Calculate a simulated ETA based on current speed and route status
      const eta = vehicle.status === "delayed" 
        ? Math.floor(10 + this.pseudoRandom(seed1) * 15) 
        : Math.floor(5 + this.pseudoRandom(seed1) * 10)
        
      // Enhance the vehicle object with additional data
      return {
        ...vehicle,
        eta, // Add estimated time of arrival
        nextStop: `Stop ${Math.floor(this.pseudoRandom(seed2) * 5) + 1}`, // Simulate next stop information
        fuelLevel: Math.floor(30 + this.pseudoRandom(seed3) * 70), // Simulate fuel level (30-100%)
      }
    })
  }
  
  /**
   * Generate optimization recommendations based on current conditions
   */
  public generateOptimizationRecommendations(
    currentTraffic: TrafficSegment[],
    routeData: RouteData[]
  ): OptimizationResult[] {
    const recommendations: OptimizationResult[] = []
    const hour = this.getCurrentHour()
    
    // Process each route
    routeData.forEach((route, routeIndex) => {
      const historicalTrafficLevel = this.historicalTraffic[route.id]?.[hour] || 0.5
      const currentTrafficLevel = this.getCurrentAverageTrafficLevel(route.id, currentTraffic)
      const demandLevel = this.demandPatterns[route.id]?.[hour] || 0.5
      
      // Check for significant traffic deviation from historical pattern
      const trafficDeviation = Math.abs(currentTrafficLevel - historicalTrafficLevel)
      
      // 1. Frequency recommendations based on demand
      if (demandLevel > 0.7) {
        const seed1 = parseInt(route.id) * 100 + 1;
        const seed2 = parseInt(route.id) * 100 + 2;
        const seed3 = parseInt(route.id) * 100 + 3;
        
        recommendations.push({
          routeId: route.id,
          originalRoute: `${route.name}: 15-minute frequency`,
          optimizedRoute: `${route.name}: ${this.getFrequencyRecommendation(route.id)} frequency`,
          reason: "High passenger demand during this time period",
          impact: {
            travelTimeReduction: 2,
            waitTimeReduction: Math.floor(8 + this.pseudoRandom(seed1) * 7),
            fuelSavings: Math.floor(50 + this.pseudoRandom(seed2) * 100),
          },
          confidence: Math.floor(85 + this.pseudoRandom(seed3) * 10),
        })
      } else if (demandLevel < 0.3) {
        const seed1 = parseInt(route.id) * 200 + 1;
        const seed2 = parseInt(route.id) * 200 + 2;
        
        recommendations.push({
          routeId: route.id,
          originalRoute: `${route.name}: 15-minute frequency`,
          optimizedRoute: `${route.name}: Reduce to 20-30 minute frequency`,
          reason: "Low passenger demand during this time period",
          impact: {
            travelTimeReduction: 0,
            waitTimeReduction: 0,
            fuelSavings: Math.floor(200 + this.pseudoRandom(seed1) * 300),
          },
          confidence: Math.floor(80 + this.pseudoRandom(seed2) * 15),
        })
      }
      
      // 2. Route diversion recommendations based on traffic
      const diversion = this.getRouteDiversion(route.id, currentTraffic)
      if (diversion) {
        const seed1 = parseInt(route.id) * 300 + 1;
        const seed2 = parseInt(route.id) * 300 + 2;
        const seed3 = parseInt(route.id) * 300 + 3;
        
        recommendations.push({
          routeId: route.id,
          originalRoute: diversion.original,
          optimizedRoute: diversion.diverted,
          reason: "Heavy traffic congestion on the usual route",
          impact: {
            travelTimeReduction: Math.floor(10 + this.pseudoRandom(seed1) * 15),
            waitTimeReduction: Math.floor(5 + this.pseudoRandom(seed2) * 10),
            fuelSavings: Math.floor(100 + this.pseudoRandom(seed3) * 200),
          },
          confidence: Math.floor(75 + this.pseudoRandom(seed1 + seed2) * 20),
        })
      }
    })
    
    return recommendations
  }
  
  /**
   * Calculate current average traffic level for a route
   */
  private getCurrentAverageTrafficLevel(routeId: string, trafficData: TrafficSegment[]): number {
    const routeSegments = trafficData.filter(segment => 
      segment.id.startsWith(`${routeId}-segment`)
    )
    
    if (routeSegments.length === 0) {
      return 0.5 // Default if no data
    }
    
    const sum = routeSegments.reduce(
      (total, segment) => total + segment.congestionLevel, 
      0
    )
    
    return sum / routeSegments.length
  }
  
  /**
   * Generate actionable recommendations for transit authorities
   */
  public generateActionableRecommendations(
    vehicles: Vehicle[],
    trafficData: TrafficSegment[],
    routeData: RouteData[]
  ): string[] {
    const recommendations: string[] = []
    
    // Count vehicles by status
    const delayedVehicles = vehicles.filter(v => v.status === "delayed").length
    const outOfServiceVehicles = vehicles.filter(v => v.status === "out-of-service").length
    
    // Check for high congestion routes
    const highCongestionRoutes = routeData.filter(r => r.congestionLevel === "high")
    
    // Routes with high passenger occupancy
    const busyRoutes = routeData.filter(r => 
      (r.currentPassengers / (r.activeVehicles * 50)) > 0.8 // assuming 50 capacity per vehicle
    )
    
    // Generate recommendations
    if (delayedVehicles > vehicles.length * 0.2) {
      recommendations.push(
        "Increase fleet size by 15% to accommodate for frequent delays and maintain service levels."
      )
    }
    
    if (outOfServiceVehicles > vehicles.length * 0.1) {
      recommendations.push(
        "Implement proactive maintenance schedule to reduce the number of out-of-service vehicles."
      )
    }
    
    if (highCongestionRoutes.length > 0) {
      const routeNames = highCongestionRoutes.map(r => r.name).join(", ")
      recommendations.push(
        `Consider adding express services for ${routeNames} during peak hours to bypass congested segments.`
      )
    }
    
    if (busyRoutes.length > 0) {
      const routeNames = busyRoutes.map(r => r.name).join(", ")
      recommendations.push(
        `Increase vehicle capacity or frequency on ${routeNames} to address high passenger demand.`
      )
    }
    
    // Time-based recommendations - ensure consistent values for server rendering
    const hour = this.getCurrentHour()
    if (hour >= 8 && hour <= 10) {
      recommendations.push(
        "Deploy 20% more vehicles during morning rush hour (8AM-10AM) to reduce wait times."
      )
    } else if (hour >= 17 && hour <= 19) {
      recommendations.push(
        "Deploy 15% more vehicles during evening rush hour (5PM-7PM) to reduce wait times."
      )
    } else if (hour >= 22 || hour <= 5) {
      recommendations.push(
        "Reduce night services (10PM-5AM) by 40% and implement on-demand service to optimize resources."
      )
    }
    
    return recommendations
  }
}

/**
 * Simulates a traffic prediction system based on historical patterns
 * instead of machine learning
 */
export class TrafficPredictor {
  // Predicted congestion levels for the next few hours (0-1 scale)
  private predictions: Record<string, number[]> = {}
  
  // Deterministic random function for stable values
  private pseudoRandom(seed: number): number {
    // Simple deterministic pseudo-random number generator
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  
  constructor() {
    // Only generate predictions on the client side
    if (typeof window !== 'undefined') {
      this.generatePredictions()
    }
  }
  
  private generatePredictions() {
    // Example route IDs
    const routeIds = ["42", "15", "7", "33", "21", "9"]
    
    // Current hour - use a fixed value for server rendering
    const currentHour = typeof window === 'undefined' ? 12 : new Date().getHours()
    
    // Generate predictions for the next 6 hours
    routeIds.forEach((routeId, routeIndex) => {
      this.predictions[routeId] = []
      
      for (let i = 0; i < 6; i++) {
        const hour = (currentHour + i) % 24
        const seed = parseInt(routeId) * 1000 + hour + i;
        
        // Simulate time-based patterns
        let baseCongestion
        if (hour >= 7 && hour <= 9) { // Morning rush
          baseCongestion = 0.7 + (this.pseudoRandom(seed) * 0.3)
        } else if (hour >= 17 && hour <= 19) { // Evening rush
          baseCongestion = 0.6 + (this.pseudoRandom(seed) * 0.4)
        } else if (hour >= 10 && hour <= 16) { // Midday
          baseCongestion = 0.3 + (this.pseudoRandom(seed) * 0.4)
        } else { // Night
          baseCongestion = 0.1 + (this.pseudoRandom(seed) * 0.2)
        }
        
        // Add some route-specific variations
        const routeFactor = parseInt(routeId) / 50 // Use route ID to add some variation
        const finalCongestion = Math.min(1, Math.max(0, baseCongestion + routeFactor))
        
        this.predictions[routeId].push(finalCongestion)
      }
    })
  }
  
  /**
   * Get traffic predictions for the next few hours
   */
  public getPredictions(routeId?: string): Record<string, number[]> {
    // For SSR, return empty or default values
    if (typeof window === 'undefined') {
      const defaultPredictions: Record<string, number[]> = {};
      const routeIds = ["42", "15", "7", "33", "21", "9"];
      
      routeIds.forEach(id => {
        defaultPredictions[id] = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]; // Default values for SSR
      });
      
      if (routeId) {
        return { [routeId]: defaultPredictions[routeId] || [] }
      }
      return defaultPredictions;
    }
    
    // For client-side rendering, return the actual predictions
    if (routeId) {
      return { [routeId]: this.predictions[routeId] || [] }
    }
    return this.predictions
  }
  
  /**
   * Predict traffic impact of an event
   */
  public predictEventImpact(
    eventLocation: [number, number], 
    eventSize: number, 
    startTime: Date, 
    endTime: Date
  ): Record<string, number> {
    // Simulate impact calculation
    // In a real system, this would use spatial data to determine which routes are affected
    
    // Generate impact scores for each route (0-1 scale)
    const routeIds = ["42", "15", "7", "33", "21", "9"]
    const impacts: Record<string, number> = {}
    
    routeIds.forEach((routeId, index) => {
      // Use deterministic values instead of random values
      const seed = eventLocation[0] * 1000 + eventLocation[1] * 100 + parseInt(routeId);
      const baseImpact = this.pseudoRandom(seed) * 0.5
      
      // Scale impact by event size
      const sizeImpact = Math.min(1, eventSize / 10000)
      
      impacts[routeId] = Math.min(1, baseImpact + sizeImpact * 0.5)
    })
    
    return impacts
  }
} 