"use client"

import { useState, useEffect } from "react"
import TransportMap from "@/components/transport-map"
import OptimizationDashboard from "@/components/optimization-dashboard"
import ClientOnly from "@/components/client-only"
import { fetchRouteData } from "@/lib/data-service"
import type { RouteData } from "@/lib/types"

export default function AdminDashboard() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  
  useEffect(() => {
    const loadRouteData = async () => {
      const data = await fetchRouteData()
      setRoutes(data)
    }
    
    loadRouteData()
    
    // Refresh data periodically
    const interval = setInterval(loadRouteData, 30000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-800 text-white p-4">
        <h1 className="text-xl font-bold">Smart Transport Admin Dashboard</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Map with diversions */}
        <div className="w-3/5 p-4">
          <div className="bg-white rounded-lg shadow-md h-full">
            <h2 className="text-lg font-semibold px-4 pt-4">Live Transit Map</h2>
            <div className="p-2 h-[calc(100%-2rem)]">
              <ClientOnly>
                <TransportMap showDiversions={true} showRoutes={true} />
              </ClientOnly>
            </div>
          </div>
        </div>
        
        {/* Right panel - Optimization Dashboard */}
        <div className="w-2/5 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-md h-full p-4">
            <h2 className="text-lg font-semibold mb-4">Optimization Center</h2>
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Route Status Overview</h3>
              <div className="space-y-2">
                {routes.map(route => (
                  <div key={route.id} className="border rounded-md p-3">
                    <div className="flex justify-between">
                      <div className="font-medium">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: route.routeColor }}
                        ></span>
                        {route.name}
                      </div>
                      <div>
                        <span 
                          className={`px-2 py-1 text-xs rounded-full ${
                            route.congestionLevel === "high" 
                              ? "bg-red-100 text-red-800" 
                              : route.congestionLevel === "medium" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {route.congestionLevel === "high" 
                            ? "Heavy Traffic" 
                            : route.congestionLevel === "medium" 
                            ? "Moderate Traffic" 
                            : "Light Traffic"}
                        </span>
                      </div>
                    </div>
                    
                    {route.diverted && (
                      <div className="mt-2 text-sm bg-orange-50 border border-orange-200 rounded-md p-2">
                        <div className="font-medium text-orange-800">Route Diverted</div>
                        <div className="text-orange-700">{route.diversionReason}</div>
                      </div>
                    )}
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Passengers: {route.currentPassengers}</div>
                      <div>Frequency: Every {route.frequency} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <ClientOnly>
              <OptimizationDashboard />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  )
} 