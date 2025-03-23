// This file contains the AI models and algorithms for route optimization

// Reinforcement Learning model for route optimization
export class RouteOptimizationRL {
  private learningRate: number
  private discountFactor: number
  private explorationRate: number
  private stateSpace: any[]
  private actionSpace: any[]
  private qTable: Map<string, Map<string, number>>

  constructor(learningRate = 0.1, discountFactor = 0.9, explorationRate = 0.1) {
    this.learningRate = learningRate
    this.discountFactor = discountFactor
    this.explorationRate = explorationRate
    this.stateSpace = []
    this.actionSpace = []
    this.qTable = new Map()
  }

  // Initialize the state and action spaces based on the transit network
  initializeSpaces(routes: any[], possibleActions: any[]) {
    this.stateSpace = routes
    this.actionSpace = possibleActions

    // Initialize Q-table with zeros
    this.stateSpace.forEach((state) => {
      const stateKey = this.getStateKey(state)
      const actionValues = new Map()

      this.actionSpace.forEach((action) => {
        const actionKey = this.getActionKey(action)
        actionValues.set(actionKey, 0)
      })

      this.qTable.set(stateKey, actionValues)
    })
  }

  // Convert state object to string key
  private getStateKey(state: any): string {
    return JSON.stringify(state)
  }

  // Convert action object to string key
  private getActionKey(action: any): string {
    return JSON.stringify(action)
  }

  // Choose an action based on the current state using epsilon-greedy policy
  chooseAction(state: any): any {
    const stateKey = this.getStateKey(state)

    // Exploration: choose a random action
    if (Math.random() < this.explorationRate) {
      const randomIndex = Math.floor(Math.random() * this.actionSpace.length)
      return this.actionSpace[randomIndex]
    }

    // Exploitation: choose the best action based on Q-values
    const actionValues = this.qTable.get(stateKey)
    if (!actionValues) return null

    let bestAction = null
    let bestValue = Number.NEGATIVE_INFINITY

    actionValues.forEach((value, actionKey) => {
      if (value > bestValue) {
        bestValue = value
        bestAction = JSON.parse(actionKey)
      }
    })

    return bestAction
  }

  // Update Q-values based on the reward received
  updateQValues(state: any, action: any, reward: number, nextState: any) {
    const stateKey = this.getStateKey(state)
    const actionKey = this.getActionKey(action)
    const nextStateKey = this.getStateKey(nextState)

    // Get current Q-value
    const actionValues = this.qTable.get(stateKey)
    if (!actionValues) return

    const currentQValue = actionValues.get(actionKey) || 0

    // Get maximum Q-value for the next state
    const nextActionValues = this.qTable.get(nextStateKey)
    if (!nextActionValues) return

    let maxNextQValue = Number.NEGATIVE_INFINITY
    nextActionValues.forEach((value) => {
      if (value > maxNextQValue) {
        maxNextQValue = value
      }
    })

    // Q-learning update formula
    const newQValue = currentQValue + this.learningRate * (reward + this.discountFactor * maxNextQValue - currentQValue)

    // Update Q-table
    actionValues.set(actionKey, newQValue)
    this.qTable.set(stateKey, actionValues)
  }

  // Train the model using historical data
  train(trainingData: { state: any; action: any; reward: number; nextState: any }[], epochs: number) {
    for (let epoch = 0; epoch < epochs; epoch++) {
      trainingData.forEach((sample) => {
        this.updateQValues(sample.state, sample.action, sample.reward, sample.nextState)
      })
    }
  }

  // Generate route optimization recommendations based on current conditions
  generateRecommendations(currentState: any, topK = 3): any[] {
    const stateKey = this.getStateKey(currentState)
    const actionValues = this.qTable.get(stateKey)
    if (!actionValues) return []

    // Convert to array and sort by Q-value
    const sortedActions = Array.from(actionValues.entries())
      .map(([actionKey, value]) => ({
        action: JSON.parse(actionKey),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topK)

    return sortedActions.map((item) => item.action)
  }
}

// Demand prediction model using time series forecasting
export class DemandPredictionModel {
  private historicalData: any[]
  private seasonalityPeriod: number
  private forecastHorizon: number

  constructor(seasonalityPeriod = 24, forecastHorizon = 24) {
    this.historicalData = []
    this.seasonalityPeriod = seasonalityPeriod // e.g., 24 hours
    this.forecastHorizon = forecastHorizon // how far ahead to predict
  }

  // Add new data points to the historical dataset
  addDataPoint(timestamp: Date, location: string, passengerCount: number, weatherCondition: string, events: string[]) {
    this.historicalData.push({
      timestamp,
      location,
      passengerCount,
      weatherCondition,
      events,
    })

    // Keep only recent data to avoid memory issues
    if (this.historicalData.length > 10000) {
      this.historicalData = this.historicalData.slice(-10000)
    }
  }

  // Simple moving average prediction
  private calculateMovingAverage(location: string, dayOfWeek: number, hourOfDay: number, windowSize = 4): number {
    const relevantData = this.historicalData.filter(
      (data) =>
        data.location === location && data.timestamp.getDay() === dayOfWeek && data.timestamp.getHours() === hourOfDay,
    )

    if (relevantData.length === 0) return 0

    const recentData = relevantData.slice(-windowSize)
    const sum = recentData.reduce((acc, data) => acc + data.passengerCount, 0)
    return sum / recentData.length
  }

  // Predict passenger demand for a specific location and time
  predictDemand(location: string, targetTime: Date, weatherForecast: string, upcomingEvents: string[]): number {
    const dayOfWeek = targetTime.getDay()
    const hourOfDay = targetTime.getHours()

    // Base prediction using historical averages
    const baselinePrediction = this.calculateMovingAverage(location, dayOfWeek, hourOfDay)

    // Adjust for weather conditions
    let weatherMultiplier = 1.0
    if (weatherForecast === "rain" || weatherForecast === "snow") {
      weatherMultiplier = 1.2 // Assume 20% more passengers during bad weather
    } else if (weatherForecast === "sunny") {
      weatherMultiplier = 0.9 // Assume 10% fewer passengers during nice weather
    }

    // Adjust for special events
    let eventBoost = 0
    if (upcomingEvents.length > 0) {
      // Simple boost based on number and type of events
      upcomingEvents.forEach((event) => {
        if (event.includes("concert") || event.includes("game")) {
          eventBoost += 100 // Major events add significant passengers
        } else if (event.includes("conference") || event.includes("exhibition")) {
          eventBoost += 50 // Medium events add moderate passengers
        } else {
          eventBoost += 20 // Minor events add some passengers
        }
      })
    }

    // Combine all factors for final prediction
    return Math.round(baselinePrediction * weatherMultiplier + eventBoost)
  }

  // Generate demand forecasts for multiple locations over the forecast horizon
  generateForecast(
    locations: string[],
    startTime: Date,
    weatherForecast: Record<string, string>,
    events: Record<string, string[]>,
  ): Record<string, number[]> {
    const forecasts: Record<string, number[]> = {}

    locations.forEach((location) => {
      forecasts[location] = []

      for (let hour = 0; hour < this.forecastHorizon; hour++) {
        const forecastTime = new Date(startTime.getTime() + hour * 60 * 60 * 1000)
        const hourlyWeather = weatherForecast[location] || "normal"
        const hourlyEvents = events[location] || []

        const prediction = this.predictDemand(location, forecastTime, hourlyWeather, hourlyEvents)
        forecasts[location].push(prediction)
      }
    })

    return forecasts
  }
}

// Traffic congestion prediction model
export class CongestionPredictionModel {
  private historicalData: any[]
  private predictionHorizon: number

  constructor(predictionHorizon = 24) {
    this.historicalData = []
    this.predictionHorizon = predictionHorizon
  }

  // Add traffic data point to historical dataset
  addTrafficDataPoint(
    timestamp: Date,
    roadSegment: string,
    congestionLevel: number,
    averageSpeed: number,
    weatherCondition: string,
  ) {
    this.historicalData.push({
      timestamp,
      roadSegment,
      congestionLevel, // 0-1 scale where 1 is completely congested
      averageSpeed,
      weatherCondition,
    })

    // Keep only recent data
    if (this.historicalData.length > 10000) {
      this.historicalData = this.historicalData.slice(-10000)
    }
  }

  // Predict congestion level for a specific road segment and time
  predictCongestion(
    roadSegment: string,
    targetTime: Date,
    weatherForecast: string,
  ): { congestionLevel: number; averageSpeed: number } {
    const dayOfWeek = targetTime.getDay()
    const hourOfDay = targetTime.getHours()

    // Find historical data for this road segment, day of week, and hour
    const relevantData = this.historicalData.filter(
      (data) =>
        data.roadSegment === roadSegment &&
        data.timestamp.getDay() === dayOfWeek &&
        data.timestamp.getHours() === hourOfDay,
    )

    if (relevantData.length === 0) {
      return { congestionLevel: 0.5, averageSpeed: 30 } // Default values if no data
    }

    // Calculate average congestion and speed from historical data
    const congestionSum = relevantData.reduce((acc, data) => acc + data.congestionLevel, 0)
    const speedSum = relevantData.reduce((acc, data) => acc + data.averageSpeed, 0)

    let avgCongestion = congestionSum / relevantData.length
    let avgSpeed = speedSum / relevantData.length

    // Adjust for weather conditions
    if (weatherForecast === "rain" || weatherForecast === "snow") {
      avgCongestion = Math.min(1, avgCongestion * 1.3) // Increase congestion by up to 30%
      avgSpeed = avgSpeed * 0.8 // Reduce speed by 20%
    } else if (weatherForecast === "fog") {
      avgCongestion = Math.min(1, avgCongestion * 1.2) // Increase congestion by up to 20%
      avgSpeed = avgSpeed * 0.85 // Reduce speed by 15%
    }

    return {
      congestionLevel: avgCongestion,
      averageSpeed: avgSpeed,
    }
  }

  // Generate congestion forecasts for multiple road segments
  generateCongestionForecast(
    roadSegments: string[],
    startTime: Date,
    weatherForecast: Record<string, string>,
  ): Record<string, { congestionLevel: number; averageSpeed: number }[]> {
    const forecasts: Record<string, { congestionLevel: number; averageSpeed: number }[]> = {}

    roadSegments.forEach((segment) => {
      forecasts[segment] = []

      for (let hour = 0; hour < this.predictionHorizon; hour++) {
        const forecastTime = new Date(startTime.getTime() + hour * 60 * 60 * 1000)
        const hourlyWeather = weatherForecast[segment] || "normal"

        const prediction = this.predictCongestion(segment, forecastTime, hourlyWeather)
        forecasts[segment].push(prediction)
      }
    })

    return forecasts
  }

  // Identify congestion hotspots based on predictions
  identifyCongestionHotspots(
    forecasts: Record<string, { congestionLevel: number; averageSpeed: number }[]>,
    threshold = 0.7,
  ): string[] {
    const hotspots: string[] = []

    Object.entries(forecasts).forEach(([segment, predictions]) => {
      // Check if any prediction in the next few hours exceeds the threshold
      const nearTermPredictions = predictions.slice(0, 6) // Next 6 hours
      const maxCongestion = Math.max(...nearTermPredictions.map((p) => p.congestionLevel))

      if (maxCongestion >= threshold) {
        hotspots.push(segment)
      }
    })

    return hotspots
  }
}

// Route optimization system that combines all models
export class SmartTransitOptimizer {
  private routeOptimizer: RouteOptimizationRL
  private demandPredictor: DemandPredictionModel
  private congestionPredictor: CongestionPredictionModel

  constructor() {
    this.routeOptimizer = new RouteOptimizationRL()
    this.demandPredictor = new DemandPredictionModel()
    this.congestionPredictor = new CongestionPredictionModel()
  }

  // Initialize the system with route data
  initialize(routes: any[], possibleActions: any[]) {
    this.routeOptimizer.initializeSpaces(routes, possibleActions)
  }

  // Generate comprehensive optimization recommendations
  generateOptimizationRecommendations(
    currentRoutes: any[],
    currentTime: Date,
    locations: string[],
    roadSegments: string[],
    weatherForecast: Record<string, string>,
    events: Record<string, string[]>,
  ): any[] {
    // 1. Predict passenger demand
    const demandForecasts = this.demandPredictor.generateForecast(locations, currentTime, weatherForecast, events)

    // 2. Predict traffic congestion
    const congestionForecasts = this.congestionPredictor.generateCongestionForecast(
      roadSegments,
      currentTime,
      weatherForecast,
    )

    // 3. Identify congestion hotspots
    const hotspots = this.congestionPredictor.identifyCongestionHotspots(congestionForecasts)

    // 4. Create current state representation for the RL model
    const currentState = {
      routes: currentRoutes,
      demand: demandForecasts,
      congestion: congestionForecasts,
      hotspots,
      time: {
        hour: currentTime.getHours(),
        dayOfWeek: currentTime.getDay(),
      },
      weather: weatherForecast,
    }

    // 5. Generate optimization recommendations using the RL model
    const recommendations = this.routeOptimizer.generateRecommendations(currentState)

    // 6. Enhance recommendations with explanations and impact estimates
    return recommendations.map((recommendation) => {
      // Calculate estimated impact
      const impactEstimate = this.estimateImpact(recommendation, currentState)

      return {
        ...recommendation,
        explanation: this.generateExplanation(recommendation, currentState),
        impact: impactEstimate,
        confidence: this.calculateConfidence(recommendation, impactEstimate),
      }
    })
  }

  // Estimate the impact of a recommendation
  private estimateImpact(recommendation: any, currentState: any): any {
    // This would be a complex calculation in a real system
    // Simplified version for demonstration
    let travelTimeReduction = 0
    let waitTimeReduction = 0
    let fuelSavings = 0

    if (recommendation.type === "reroute") {
      // Estimate impact of rerouting
      const affectedSegments = recommendation.segments || []

      // Check if reroute avoids congestion hotspots
      const avoidedHotspots = currentState.hotspots.filter((hotspot: string) => affectedSegments.includes(hotspot))

      if (avoidedHotspots.length > 0) {
        travelTimeReduction = 10 + Math.random() * 10 // 10-20 minutes saved
        fuelSavings = 5 + Math.random() * 15 // $5-20 saved
      }
    } else if (recommendation.type === "frequency") {
      // Estimate impact of frequency changes
      const location = recommendation.location
      const demandForecast = currentState.demand[location] || []

      if (recommendation.action === "increase" && demandForecast.some((d: number) => d > 200)) {
        waitTimeReduction = 5 + Math.random() * 10 // 5-15 minutes saved
      } else if (recommendation.action === "decrease" && demandForecast.every((d: number) => d < 100)) {
        fuelSavings = 100 + Math.random() * 400 // $100-500 saved
      }
    }

    return {
      travelTimeReduction: Math.round(travelTimeReduction),
      waitTimeReduction: Math.round(waitTimeReduction),
      fuelSavings: Math.round(fuelSavings),
    }
  }

  // Generate human-readable explanation for a recommendation
  private generateExplanation(recommendation: any, currentState: any): string {
    if (recommendation.type === "reroute") {
      return `Rerouting suggested due to high congestion levels on the original route and predicted lower traffic on the alternative route.`
    } else if (recommendation.type === "frequency") {
      if (recommendation.action === "increase") {
        return `Increased frequency recommended due to higher predicted passenger demand in the next few hours.`
      } else {
        return `Decreased frequency recommended due to historically low ridership during this time period.`
      }
    }
    return "Optimization recommended based on current conditions and historical patterns."
  }

  // Calculate confidence score for a recommendation
  private calculateConfidence(recommendation: any, impact: any): number {
    // Simple confidence calculation based on estimated impact
    let confidence = 70 // Base confidence

    if (impact.travelTimeReduction > 15 || impact.waitTimeReduction > 10 || impact.fuelSavings > 300) {
      confidence += 20 // High impact increases confidence
    } else if (impact.travelTimeReduction > 5 || impact.waitTimeReduction > 3 || impact.fuelSavings > 100) {
      confidence += 10 // Moderate impact slightly increases confidence
    }

    // Add some randomness to make it more realistic
    confidence += Math.floor(Math.random() * 10)

    // Cap at 99%
    return Math.min(99, confidence)
  }
}

