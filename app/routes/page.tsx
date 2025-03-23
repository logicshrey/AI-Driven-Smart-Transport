"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowUpDown, Bus, Clock, MapPin, RotateCw, Users } from "lucide-react"
import { fetchRouteData, generateOptimizationRecommendations } from "@/lib/data-service"
import type { RouteData, OptimizationResult } from "@/lib/types"

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const routeData = await fetchRouteData()
        const optimizationResults = await generateOptimizationRecommendations()

        setRoutes(routeData)
        setOptimizations(optimizationResults)
        setLoading(false)
      } catch (error) {
        console.error("Error loading route data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const routeData = await fetchRouteData()
      const optimizationResults = await generateOptimizationRecommendations()

      setRoutes(routeData)
      setOptimizations(optimizationResults)
      setLoading(false)
    } catch (error) {
      console.error("Error refreshing data:", error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Bus className="h-6 w-6 text-primary" />
            <span>SmartTransit</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm font-medium">
              Dashboard
            </a>
            <a href="/routes" className="text-sm font-medium text-primary">
              Routes
            </a>
            <a href="/analytics" className="text-sm font-medium">
              Analytics
            </a>
            <a href="/settings" className="text-sm font-medium">
              Settings
            </a>
            <Button>Sign In</Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Route Management</h1>
              <Button onClick={handleRefresh} disabled={loading}>
                <RotateCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Active Routes</TabsTrigger>
                <TabsTrigger value="optimized">Optimized Routes</TabsTrigger>
                <TabsTrigger value="historical">Historical Data</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground">Loading route data...</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {routes.map((route) => (
                      <RouteCard
                        key={route.id}
                        routeNumber={route.id}
                        routeName={route.name}
                        status={route.status}
                        activeVehicles={route.activeVehicles}
                        currentPassengers={route.currentPassengers}
                        averageDelay={route.averageDelay}
                        congestionLevel={route.congestionLevel}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="optimized" className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-4">AI-Optimized Route Suggestions</h2>
                  {loading ? (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">Loading optimization suggestions...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {optimizations.map((optimization, index) => (
                        <OptimizationSuggestion
                          key={index}
                          routeNumber={optimization.routeId}
                          originalRoute={optimization.originalRoute}
                          optimizedRoute={optimization.optimizedRoute}
                          reason={optimization.reason}
                          impact={`Reduces travel time by ${optimization.impact.travelTimeReduction} minutes, saves $${optimization.impact.fuelSavings}/day in fuel costs`}
                          confidence={optimization.confidence}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="historical" className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-4">Historical Performance Analysis</h2>
                  <p className="text-muted-foreground mb-4">
                    Historical data analysis helps identify patterns and optimize future routes
                  </p>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Historical performance charts and graphs</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function RouteCard({
  routeNumber,
  routeName,
  status,
  activeVehicles,
  currentPassengers,
  averageDelay,
  congestionLevel,
}: {
  routeNumber: string
  routeName: string
  status: "normal" | "optimized" | "reduced"
  activeVehicles: number
  currentPassengers: number
  averageDelay: number
  congestionLevel: "low" | "medium" | "high"
}) {
  const statusColors = {
    normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    optimized: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    reduced: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  }

  const congestionColors = {
    low: "text-green-600 dark:text-green-400",
    medium: "text-amber-600 dark:text-amber-400",
    high: "text-red-600 dark:text-red-400",
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {routeNumber}
            </div>
            <CardTitle>{routeName}</CardTitle>
          </div>
          <Badge className={statusColors[status]}>
            {status === "normal" ? "Normal" : status === "optimized" ? "Optimized" : "Reduced Service"}
          </Badge>
        </div>
        <CardDescription>Route #{routeNumber}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Bus className="h-3 w-3" /> Active Vehicles
            </span>
            <span className="font-medium">{activeVehicles}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Current Passengers
            </span>
            <span className="font-medium">{currentPassengers}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Avg. Delay
            </span>
            <span className="font-medium">{averageDelay} min</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Congestion
            </span>
            <span className={`font-medium ${congestionColors[congestionLevel]}`}>
              {congestionLevel.charAt(0).toUpperCase() + congestionLevel.slice(1)}
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4">
          <MapPin className="mr-2 h-4 w-4" />
          View Route Details
        </Button>
      </CardContent>
    </Card>
  )
}

function OptimizationSuggestion({
  routeNumber,
  originalRoute,
  optimizedRoute,
  reason,
  impact,
  confidence,
}: {
  routeNumber: string
  originalRoute: string
  optimizedRoute: string
  reason: string
  impact: string
  confidence: number
}) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const handleSimulate = () => {
    setIsSimulating(true)
    // Simulate API call
    setTimeout(() => {
      setIsSimulating(false)
      alert(
        `Simulation complete for Route ${routeNumber}. The optimization would save approximately ${impact.split("saves $")[0].split("by ")[1]} of travel time.`,
      )
    }, 2000)
  }

  const handleApply = () => {
    setIsApplying(true)
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false)
      alert(`Optimization applied to Route ${routeNumber}. Changes will take effect within 15 minutes.`)
    }, 2000)
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {routeNumber}
          </div>
          <h3 className="font-semibold">Route {routeNumber} Optimization</h3>
        </div>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {confidence}% Confidence
        </Badge>
      </div>
      <div className="space-y-2 mt-3">
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <span className="text-sm font-medium">Current:</span>
          <span className="text-sm">{originalRoute}</span>
          <span className="text-sm font-medium">Optimized:</span>
          <span className="text-sm text-primary">{optimizedRoute}</span>
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <span className="text-sm">{reason}</span>
          </div>
          <div className="flex items-start gap-2 mt-1">
            <ArrowUpDown className="h-4 w-4 text-green-500 mt-0.5" />
            <span className="text-sm">{impact}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="default" className="w-full" onClick={handleApply} disabled={isApplying || isSimulating}>
          {isApplying ? "Applying..." : "Apply Optimization"}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSimulate} disabled={isApplying || isSimulating}>
          {isSimulating ? "Simulating..." : "Simulate"}
        </Button>
      </div>
    </div>
  )
}

