"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bus, Calendar, Download, TrendingDown, TrendingUp, Users } from "lucide-react"
import { fetchPassengerData, fetchRouteData, fetchWeatherData, fetchEventsData } from "@/lib/data-service"

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState("7d")
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    totalPassengers: 0,
    waitTimeChange: 0,
    onTimePerformance: 0,
    fuelEfficiency: 0,
    topRoutes: [] as { id: string; name: string; performance: number }[],
    improvementRoutes: [] as { id: string; name: string; performance: number }[],
    weatherImpact: "",
    demandSurge: "",
    maintenanceAlert: "",
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch data from various sources
        const [passengerData, routeData, weatherData, eventsData] = await Promise.all([
          fetchPassengerData(),
          fetchRouteData(),
          fetchWeatherData(),
          fetchEventsData(),
        ])

        // Process data for analytics
        const totalPassengers = passengerData.totalPassengers

        // Calculate wait time change (simulated)
        const waitTimeChange = -18.5 + (Math.random() * 5 - 2.5) // -21% to -16%

        // Calculate on-time performance (simulated)
        const onTimePerformance = 85 + Math.random() * 15 // 85-100%
        const onTimeChange = 5.2 + (Math.random() * 2 - 1) // 4.2-6.2%

        // Calculate fuel efficiency (simulated)
        const fuelEfficiency = 5.5 + Math.random() * 0.6 // 5.5-6.1 mpg
        const fuelChange = 3.1 + (Math.random() * 1 - 0.5) // 2.6-3.6%

        // Sort routes by performance
        const sortedRoutes = [...routeData].sort((a, b) => {
          // Higher is better for on-time performance
          const aPerformance = 100 - a.averageDelay * 10
          const bPerformance = 100 - b.averageDelay * 10
          return bPerformance - aPerformance
        })

        // Top performing routes
        const topRoutes = sortedRoutes.slice(0, 3).map((route) => ({
          id: route.id,
          name: route.name,
          performance: 100 - route.averageDelay * 10,
        }))

        // Routes needing improvement
        const improvementRoutes = sortedRoutes
          .slice(-3)
          .reverse()
          .map((route) => ({
            id: route.id,
            name: route.name,
            performance: 100 - route.averageDelay * 10,
          }))

        // Generate AI predictions based on weather and events
        let weatherImpact = ""
        if (weatherData.condition === "rain" || weatherData.condition === "snow") {
          weatherImpact = `Forecasted ${weatherData.condition} on Thursday is predicted to increase travel times by 12-18% across all routes.`
        } else if (weatherData.condition === "fog") {
          weatherImpact = `Forecasted fog on Thursday is predicted to increase travel times by 8-12% across all routes.`
        } else {
          weatherImpact = `Current ${weatherData.condition} conditions are not expected to significantly impact travel times.`
        }

        // Generate demand surge prediction
        const demandSurge =
          eventsData.length > 0
            ? `The AI model predicts a ${20 + Math.floor(Math.random() * 30)}% increase in passenger demand in the ${eventsData[0].location.name} district due to the upcoming ${eventsData[0].type}.`
            : `The AI model predicts a 35% increase in passenger demand in the University district next Tuesday due to the start of the new semester.`

        // Generate maintenance prediction
        const maintenanceAlert = `Predictive maintenance model suggests servicing vehicles #${Math.floor(Math.random() * 200)}, #${Math.floor(Math.random() * 200)}, and #${Math.floor(Math.random() * 200)} within the next 7 days to prevent potential breakdowns.`

        setAnalyticsData({
          totalPassengers,
          waitTimeChange,
          onTimePerformance,
          fuelEfficiency,
          topRoutes,
          improvementRoutes,
          weatherImpact,
          demandSurge,
          maintenanceAlert,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error loading analytics data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [timePeriod])

  const handleExport = () => {
    alert("Analytics data export initiated. The file will be emailed to your account.")
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
            <a href="/routes" className="text-sm font-medium">
              Routes
            </a>
            <a href="/analytics" className="text-sm font-medium text-primary">
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
              <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Passengers"
                value={loading ? "Loading..." : analyticsData.totalPassengers.toLocaleString()}
                change="+12.3%"
                trend="up"
                description="vs. previous period"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Average Wait Time"
                value={loading ? "Loading..." : "4.2 min"}
                change={loading ? "Loading..." : `${analyticsData.waitTimeChange.toFixed(1)}%`}
                trend="down"
                description="vs. previous period"
                icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="On-Time Performance"
                value={loading ? "Loading..." : `${analyticsData.onTimePerformance.toFixed(1)}%`}
                change="+5.2%"
                trend="up"
                description="vs. previous period"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Fuel Efficiency"
                value={loading ? "Loading..." : `${analyticsData.fuelEfficiency.toFixed(1)} mpg`}
                change="+3.1%"
                trend="up"
                description="vs. previous period"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            <Tabs defaultValue="performance">
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="demand">Passenger Demand</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
                <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
              </TabsList>
              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Route Performance Analysis</CardTitle>
                    <CardDescription>Comparative analysis of route performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Performance metrics visualization</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Routes</CardTitle>
                      <CardDescription>Routes with the best on-time performance and efficiency</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center h-40">
                          <p className="text-muted-foreground">Loading route data...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analyticsData.topRoutes.map((route, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                  {route.id}
                                </div>
                                <div>
                                  <div className="font-medium">{route.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {route.performance.toFixed(1)}% on-time
                                  </div>
                                </div>
                              </div>
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Routes Needing Improvement</CardTitle>
                      <CardDescription>Routes with performance issues requiring optimization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center h-40">
                          <p className="text-muted-foreground">Loading route data...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analyticsData.improvementRoutes.map((route, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                  {route.id}
                                </div>
                                <div>
                                  <div className="font-medium">{route.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {route.performance.toFixed(1)}% on-time
                                  </div>
                                </div>
                              </div>
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="demand" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Passenger Demand Patterns</CardTitle>
                    <CardDescription>Analysis of passenger volume by time, location, and demographics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Passenger demand heatmap and trends</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Peak Hours Analysis</CardTitle>
                      <CardDescription>Passenger volume during different times of day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Peak hours chart</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Demand Forecasting</CardTitle>
                      <CardDescription>AI-powered predictions for future passenger demand</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Demand forecast visualization</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="efficiency" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Operational Efficiency Metrics</CardTitle>
                    <CardDescription>Key performance indicators for system efficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Efficiency metrics dashboard</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fuel Consumption</CardTitle>
                      <CardDescription>Analysis of fuel usage and efficiency</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Fuel metrics chart</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Utilization</CardTitle>
                      <CardDescription>Analysis of vehicle capacity usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Utilization chart</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Metrics</CardTitle>
                      <CardDescription>Vehicle maintenance and downtime</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Maintenance metrics</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="predictions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Predictions & Recommendations</CardTitle>
                    <CardDescription>Machine learning-based insights and forecasts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-40">
                        <p className="text-muted-foreground">Loading AI predictions...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                          <h3 className="font-semibold mb-2">Demand Surge Prediction</h3>
                          <p className="text-sm mb-2">{analyticsData.demandSurge}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>Recommendation: Increase Route 15 frequency by 25% from 7AM-10AM</span>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <h3 className="font-semibold mb-2">Weather Impact Analysis</h3>
                          <p className="text-sm mb-2">{analyticsData.weatherImpact}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            <span>Recommendation: Adjust schedules to account for weather delays</span>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <h3 className="font-semibold mb-2">Maintenance Optimization</h3>
                          <p className="text-sm mb-2">{analyticsData.maintenanceAlert}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span>Recommendation: Schedule maintenance during off-peak hours</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  trend,
  description,
  icon,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1">
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <p className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"}`}>{change}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

