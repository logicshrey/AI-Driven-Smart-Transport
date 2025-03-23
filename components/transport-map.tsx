"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  fetchVehicleLocations,
  fetchTrafficData,
  fetchRouteData,
} from "@/lib/data-service"
import type { Vehicle, TrafficSegment, RouteData } from "@/lib/types"

// Set your Mapbox token here (use a proper env variable in production)
mapboxgl.accessToken = "pk.eyJ1Ijoic2VqYWwxMjM0NTY3ODkiLCJhIjoiY204a3Z6Ym04MHVzcjJpc2luczJ3bWpocSJ9.O_AGdzWe4aPSck7PI2wW1A"

interface TransportMapProps {
  showRoutes?: boolean
  showDiversions?: boolean
  bookedVehicleId?: string
}

export default function TransportMap({
  showRoutes = false,
  showDiversions = false,
  bookedVehicleId,
}: TransportMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Initialize map
  useEffect(() => {
    if (!isClient || !mapContainer.current) return
    
    // City center coordinates (Panvel, India)
    const CITY_CENTER = {
      lat: 19.0289,
      lng: 73.1095,
    }
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [CITY_CENTER.lng, CITY_CENTER.lat],
      zoom: 13,
    })
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [isClient])
  
  // Update markers for vehicles
  useEffect(() => {
    if (!isClient || !map.current) return
    
    // Function to update vehicle markers
    const updateVehicleMarkers = async () => {
      if (!map.current) return
      
      try {
        const vehicles = await fetchVehicleLocations()
        
        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []
        
        // Add new markers for each vehicle
        vehicles.forEach((vehicle) => {
          // Create a custom HTML element for the marker
          const el = document.createElement("div")
          
          // Check if this is the booked vehicle
          const isBooked = bookedVehicleId && vehicle.id === bookedVehicleId
          
          // Style for normal vs. booked vehicle
          if (isBooked) {
            el.className = "vehicle-marker booked-vehicle"
            el.innerHTML = `
              <div class="relative">
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                <div class="bus-icon bg-blue-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
              </div>
            `
          } else {
            el.className = "vehicle-marker"
            el.innerHTML = `
              <div class="bus-icon ${vehicle.status === "delayed" ? "bg-amber-500" : "bg-green-600"} text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
            `
          }
          
          // Add CSS to head if not already present
          if (!document.getElementById("vehicle-marker-styles")) {
            const style = document.createElement("style")
            style.id = "vehicle-marker-styles"
            style.innerHTML = `
              .vehicle-marker {
                cursor: pointer;
              }
              .bus-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .booked-vehicle .bus-icon {
                width: 30px;
                height: 30px;
                z-index: 10;
              }
            `
            document.head.appendChild(style)
          }
          
          // Create the marker
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([vehicle.longitude, vehicle.latitude])
            .addTo(map.current!)
          
          // Create popup with vehicle info
          const popupContent = `
            <div class="p-2">
              <div class="font-bold">${vehicle.route}</div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-1">
                <div>Status:</div>
                <div class="${vehicle.status === "on-time" ? "text-green-600" : "text-amber-600"}">
                  ${vehicle.status === "on-time" ? "On time" : "Delayed"}
                </div>
                <div>Passengers:</div>
                <div>${vehicle.passengerCount}/${vehicle.capacity}</div>
                <div>Speed:</div>
                <div>${Math.round(vehicle.speed)} km/h</div>
                <div>Fuel Level:</div>
                <div>${vehicle.fuelLevel}%</div>
                <div>Next Stop:</div>
                <div>${vehicle.nextStop}</div>
                <div>ETA:</div>
                <div>${vehicle.eta} min</div>
              </div>
            </div>
          `
          
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent)
          
          marker.setPopup(popup)
          
          // Store marker for later removal
          markersRef.current.push(marker)
        })
      } catch (error) {
        console.error("Error fetching vehicle data:", error)
      }
    }
    
    // Initial update
    updateVehicleMarkers()
    
    // Set interval to update markers periodically
    const interval = setInterval(updateVehicleMarkers, 10000)
    
    // Clean up on unmount
    return () => {
      clearInterval(interval)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [isClient, bookedVehicleId])
  
  // Update traffic overlay
  useEffect(() => {
    if (!isClient || !map.current) return
    
    let trafficLayerIdsToRemove: string[] = []
    
    // Function to update traffic overlay
    const updateTrafficOverlay = async () => {
      if (!map.current || !map.current.loaded()) return
      
      try {
        const trafficData = await fetchTrafficData()
        
        // Remove existing layers
        trafficLayerIdsToRemove.forEach((id) => {
          if (map.current && map.current.getLayer(id)) {
            map.current.removeLayer(id)
          }
          if (map.current && map.current.getSource(id)) {
            map.current.removeSource(id)
          }
        })
        
        trafficLayerIdsToRemove = []
        
        // Add new traffic segments
        trafficData.forEach((segment, index) => {
          const segmentId = `traffic-segment-${index}`
          
          if (map.current && !map.current.getSource(segmentId)) {
            map.current.addSource(segmentId, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [segment.coordinates[0][1], segment.coordinates[0][0]],
                    [segment.coordinates[1][1], segment.coordinates[1][0]],
                  ],
                },
              },
            })
            
            // Determine color based on congestion level
            let color = "#22c55e" // green
            let width = 4
            
            if (segment.congestionLevel > 0.7) {
              color = "#ef4444" // red
              width = 6
            } else if (segment.congestionLevel > 0.4) {
              color = "#f59e0b" // amber
              width = 5
            }
            
            map.current.addLayer({
              id: segmentId,
              type: "line",
              source: segmentId,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": color,
                "line-width": width,
                "line-opacity": 0.8,
              },
            })
            
            trafficLayerIdsToRemove.push(segmentId)
          }
        })
      } catch (error) {
        console.error("Error fetching traffic data:", error)
      }
    }
    
    // Wait for map to load before adding traffic data
    if (map.current.loaded()) {
      updateTrafficOverlay()
    } else {
      map.current.on("load", updateTrafficOverlay)
    }
    
    // Set interval to update traffic overlay periodically
    const interval = setInterval(updateTrafficOverlay, 30000)
    
    // Clean up on unmount
    return () => {
      clearInterval(interval)
      
      // Remove traffic layers
      if (map.current) {
        trafficLayerIdsToRemove.forEach((id) => {
          if (map.current && map.current.getLayer(id)) {
            map.current.removeLayer(id)
          }
          if (map.current && map.current.getSource(id)) {
            map.current.removeSource(id)
          }
        })
      }
    }
  }, [isClient])
  
  // Add route paths if enabled
  useEffect(() => {
    if (!isClient || !map.current || !showRoutes) return
    
    let routeLayerIdsToRemove: string[] = []
    
    // Function to update route paths
    const updateRoutePaths = async () => {
      if (!map.current || !map.current.loaded()) return
      
      try {
        const routeData = await fetchRouteData()
        
        // Remove existing route layers
        routeLayerIdsToRemove.forEach((id) => {
          if (map.current && map.current.getLayer(id)) {
            map.current.removeLayer(id)
          }
          if (map.current && map.current.getSource(id)) {
            map.current.removeSource(id)
          }
        })
        
        routeLayerIdsToRemove = []
        
        // Add route paths
        routeData.forEach((route) => {
          // Only proceed if route has a path
          if (route.path && route.path.length >= 2) {
            const routeId = `route-${route.id}`
            
            // Convert path format to GeoJSON coordinates
            const coordinates = route.path.map(point => [point[1], point[0]])
            
            if (map.current && !map.current.getSource(routeId)) {
              map.current.addSource(routeId, {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates,
                  },
                },
              })
              
              map.current.addLayer({
                id: routeId,
                type: "line",
                source: routeId,
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": route.routeColor || "#3b82f6",
                  "line-width": 3,
                  "line-opacity": 0.6,
                  "line-dasharray": [1, 2],
                },
              })
              
              routeLayerIdsToRemove.push(routeId)
            }
            
            // Add diverted route if available and diversions are enabled
            if (showDiversions && route.diverted && route.divertedPath && route.divertedPath.length >= 2) {
              const divertedRouteId = `route-${route.id}-diverted`
              
              // Convert diverted path format to GeoJSON coordinates
              const divertedCoordinates = route.divertedPath.map(point => [point[1], point[0]])
              
              if (map.current && !map.current.getSource(divertedRouteId)) {
                map.current.addSource(divertedRouteId, {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: divertedCoordinates,
                    },
                  },
                })
                
                map.current.addLayer({
                  id: divertedRouteId,
                  type: "line",
                  source: divertedRouteId,
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    "line-color": "#f97316", // orange for diverted routes
                    "line-width": 4,
                    "line-opacity": 0.8,
                  },
                })
                
                routeLayerIdsToRemove.push(divertedRouteId)
              }
            }
          }
        })
      } catch (error) {
        console.error("Error fetching route data:", error)
      }
    }
    
    // Wait for map to load before adding route data
    if (map.current.loaded()) {
      updateRoutePaths()
    } else {
      map.current.on("load", updateRoutePaths)
    }
    
    // Clean up on unmount
    return () => {
      // Remove route layers
      if (map.current) {
        routeLayerIdsToRemove.forEach((id) => {
          if (map.current && map.current.getLayer(id)) {
            map.current.removeLayer(id)
          }
          if (map.current && map.current.getSource(id)) {
            map.current.removeSource(id)
          }
        })
      }
    }
  }, [isClient, showRoutes, showDiversions])
  
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      {!isClient ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      ) : (
        <div ref={mapContainer} className="h-full w-full" />
      )}
    </div>
  )
}

