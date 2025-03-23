"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bus, Clock, Activity, TrendingUp, AlertCircle, MapPin, 
  ArrowDownCircle, ArrowUpCircle, BarChart4 
} from "lucide-react"
import type { OptimizationResult, RouteData, Vehicle } from "@/lib/types"
import { TrafficPredictor } from "@/lib/route-optimizer"
import { generateOptimizationRecommendations } from "@/lib/data-service"

interface OptimizationDashboardProps {
  vehicles?: Vehicle[]
  routes?: RouteData[]
  recommendations?: OptimizationResult[]
  actionableRecommendations?: string[]
}

export default function OptimizationDashboard({
  vehicles = [],
  routes = [],
  recommendations = [],
  actionableRecommendations = [],
}: OptimizationDashboardProps) {
  const [activeTab, setActiveTab] = useState("recommendations")
  const [trafficPredictions, setTrafficPredictions] = useState<Record<string, number[]>>({})
  const [isClient, setIsClient] = useState(false)
  const [optimizationData, setOptimizationData] = useState<OptimizationResult[]>([])
  const initialRecommendationsRef = useRef(recommendations)
  const [insightsList, setInsightsList] = useState<string[]>([
    "Increase fleet size by 3 vehicles during morning peak hours (7-9 AM)",
    "Schedule maintenance for low-demand periods (11 AM-2 PM)",
    "Add express service for Route 42 during evening rush hour",
    "Reduce frequency on Route 7 during mid-day to save fuel",
    "Consider route extension to newly developed Sector 12",
    "Deploy additional buses on Route 15 to handle weekend demand"
  ])
  
  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true)
    
    // Initialize traffic predictor only on the client side
    if (typeof window !== 'undefined') {
      const predictor = new TrafficPredictor()
      setTrafficPredictions(predictor.getPredictions())
      
      // Load optimization data if none provided
      const loadRecommendations = async () => {
        if (initialRecommendationsRef.current.length === 0) {
          try {
            const data = await generateOptimizationRecommendations()
            setOptimizationData(data)
          } catch (error) {
            console.error("Error loading optimization recommendations:", error)
          }
        } else {
          setOptimizationData(initialRecommendationsRef.current)
        }
      }
      
      loadRecommendations()
    }
  }, []) // Remove recommendations from dependency array
  
  // Priority colors
  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    low: "bg-green-100 text-green-800 border-green-300",
  }
  
  // Format congestion level for display
  const formatCongestion = (level: number): string => {
    if (level > 0.7) return "High"
    if (level > 0.4) return "Medium"
    return "Low"
  }
  
  // Get color class based on congestion level
  const getCongestionColor = (level: number): string => {
    if (level > 0.7) return "text-red-600"
    if (level > 0.4) return "text-amber-500"
    return "text-green-600"
  }
  
  // Format priority level with capitalization and null check
  const formatPriority = (priority: string | undefined): string => {
    if (!priority) return "Medium Priority";
    return `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="recommendations" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">
            <TrendingUp className="mr-2 h-4 w-4" />
            Route Recommendations
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <BarChart4 className="mr-2 h-4 w-4" />
            Traffic Predictions
          </TabsTrigger>
          <TabsTrigger value="actionable">
            <AlertCircle className="mr-2 h-4 w-4" />
            Actionable Insights
          </TabsTrigger>
        </TabsList>
        
        {/* Route Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {optimizationData.map((recommendation, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      <div className="flex items-center">
                        <Bus className="mr-2 h-5 w-5 text-blue-600" />
                        Route {recommendation.routeId}
                      </div>
                    </CardTitle>
                    <Badge 
                      className={`${recommendation.priority && priorityColors[recommendation.priority] || priorityColors.medium} border px-2 py-1`}
                    >
                      {formatPriority(recommendation.priority)}
                    </Badge>
                  </div>
                  <CardDescription>{recommendation.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Current Route</div>
                      <div className="font-semibold">
                        {recommendation.originalRoute}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Recommended Route</div>
                      <div className="font-semibold text-blue-700">
                        {recommendation.optimizedRoute}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="flex flex-col items-center rounded-md border bg-background p-2">
                        <Clock className="h-4 w-4 text-amber-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Travel Time</span>
                        <span className="font-medium">-{recommendation.impact?.travelTimeReduction || 0} min</span>
                      </div>
                      <div className="flex flex-col items-center rounded-md border bg-background p-2">
                        <Activity className="h-4 w-4 text-purple-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Wait Time</span>
                        <span className="font-medium">-{recommendation.impact?.waitTimeReduction || 0} min</span>
                      </div>
                      <div className="flex flex-col items-center rounded-md border bg-background p-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Fuel Savings</span>
                        <span className="font-medium">₹{recommendation.impact?.fuelSavings || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end pt-2">
                      <div className="text-sm text-muted-foreground mr-2">
                        Confidence: {recommendation.confidence || 85}%
                      </div>
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {optimizationData.length === 0 && (
              <div className="col-span-2 flex justify-center p-8">
                <p className="text-muted-foreground">Loading optimization recommendations...</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Traffic Predictions Tab - Only render when on client side */}
        <TabsContent value="predictions" className="space-y-4">
          {isClient ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(trafficPredictions).map(([routeId, predictions]) => {
                const routeName = `Route ${routeId}`
                
                // Get current hour (client-side only)
                const hourNow = new Date().getHours()
                
                return (
                  <Card key={routeId}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                          {routeName}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Traffic predictions for the next 6 hours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Congestion</div>
                            <div className={`font-semibold ${getCongestionColor(predictions[0])}`}>
                              {formatCongestion(predictions[0])} ({(predictions[0] * 100).toFixed(0)}%)
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Trend</div>
                            <div className="font-semibold">
                              {predictions[1] > predictions[0] ? (
                                <div className="flex items-center text-red-600">
                                  <ArrowUpCircle className="mr-1 h-4 w-4" />
                                  Increasing
                                </div>
                              ) : (
                                <div className="flex items-center text-green-600">
                                  <ArrowDownCircle className="mr-1 h-4 w-4" />
                                  Decreasing
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">6-Hour Forecast</div>
                          <div className="grid grid-cols-6 gap-1 h-24">
                            {predictions.map((prediction, i) => {
                              // Calculate bar height based on congestion level
                              const height = Math.max(20, prediction * 100)
                              const hour = (hourNow + i) % 24
                              
                              return (
                                <div key={i} className="flex flex-col items-center">
                                  <div className="flex-grow flex items-end h-full">
                                    <div 
                                      className={`w-full rounded-t-sm ${getCongestionColor(prediction)}`}
                                      style={{ 
                                        height: `${height}%`, 
                                        backgroundColor: `${prediction > 0.7 ? '#fee2e2' : prediction > 0.4 ? '#fef3c7' : '#dcfce7'}` 
                                      }}
                                    />
                                  </div>
                                  <div className="text-xs mt-1">{hour}:00</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {Object.keys(trafficPredictions).length === 0 && (
                <div className="col-span-3 flex justify-center p-8">
                  <p className="text-muted-foreground">Initializing traffic predictions...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">Loading predictions...</p>
            </div>
          )}
        </TabsContent>
        
        {/* Actionable Insights Tab */}
        <TabsContent value="actionable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Optimization Recommendations</CardTitle>
              <CardDescription>
                Actionable insights to improve transit efficiency and reduce costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsList.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-md">
                    <div className="mt-0.5">
                      {index % 3 === 0 ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : index % 3 === 1 ? (
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Bus className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{insight}</p>
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className="mr-2">
                          {index % 3 === 0 ? "High Impact" : index % 3 === 1 ? "Medium Impact" : "Low Impact"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {index % 2 === 0 ? "Short term" : "Long term"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 