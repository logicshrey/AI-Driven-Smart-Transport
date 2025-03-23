"use client"

import { useState, useEffect } from "react"
import TransportMap from "@/components/transport-map"
import ClientOnly from "@/components/client-only"
import { fetchVehicleLocations, fetchRouteData } from "@/lib/data-service"
import type { Vehicle, RouteData } from "@/lib/types"

export default function PassengerPortal() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookedVehicleId, setBookedVehicleId] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  
  useEffect(() => {
    const loadData = async () => {
      const routeData = await fetchRouteData()
      const vehicleData = await fetchVehicleLocations()
      
      setRoutes(routeData)
      setVehicles(vehicleData)
    }
    
    loadData()
    
    // Refresh data periodically
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])
  
  const handleBookTicket = (vehicleId: string) => {
    setBookedVehicleId(vehicleId)
    setSelectedVehicle(vehicles.find(v => v.id === vehicleId) || null)
  }
  
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Smart Transport Passenger Portal</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Bus selection */}
        <div className="w-1/3 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-md h-full p-4">
            <h2 className="text-lg font-semibold mb-4">Available Buses</h2>
            
            {bookedVehicleId ? (
              <div className="mb-6">
                <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
                  <h3 className="font-medium">Your Booked Bus</h3>
                  <p className="text-sm">Ticket confirmed for bus #{bookedVehicleId}</p>
                  {selectedVehicle && (
                    <div className="mt-2 text-sm">
                      <p>Route: {selectedVehicle.route}</p>
                      <p>Current Stop: {selectedVehicle.currentStop}</p>
                      <p>Next Stop: {selectedVehicle.nextStop}</p>
                      <p>ETA: {selectedVehicle.eta} minutes</p>
                      <p>Status: <span className={selectedVehicle.status === "on-time" ? "text-green-700" : "text-amber-700"}>
                        {selectedVehicle.status === "on-time" ? "On Time" : "Delayed"}
                      </span></p>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      setBookedVehicleId(null)
                      setSelectedVehicle(null)
                    }}
                    className="mt-2 text-sm bg-white border border-red-300 text-red-600 px-3 py-1 rounded-md"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Select a bus to see its current location and book a ticket</p>
              </div>
            )}
            
            <div>
              {routes.map(route => (
                <div key={route.id} className="mb-4">
                  <h3 className="font-medium flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: route.routeColor }}
                    ></span>
                    {route.name}
                    {route.diverted && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                        Diverted
                      </span>
                    )}
                  </h3>
                  
                  <div className="mt-2 ml-5 space-y-2">
                    {vehicles
                      .filter(vehicle => vehicle.routeId === route.id)
                      .map(vehicle => (
                        <div 
                          key={vehicle.id} 
                          className={`p-3 rounded-md text-sm cursor-pointer ${
                            bookedVehicleId === vehicle.id
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <div className="flex justify-between">
                            <div>Bus #{vehicle.id}</div>
                            <div className={vehicle.status === "on-time" ? "text-green-600" : "text-amber-600"}>
                              {vehicle.status === "on-time" ? "On Time" : "Delayed"}
                            </div>
                          </div>
                          
                          <div className="mt-1">
                            {vehicle.currentStop} → {vehicle.nextStop}
                          </div>
                          
                          <div className="flex justify-between mt-2">
                            <div>
                              {vehicle.passengerCount}/{vehicle.capacity} passengers
                            </div>
                            <div>
                              ETA: {vehicle.eta} min
                            </div>
                          </div>
                          
                          {bookedVehicleId !== vehicle.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookTicket(vehicle.id)
                              }}
                              className="mt-2 w-full bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
                              disabled={vehicle.passengerCount >= vehicle.capacity}
                            >
                              {vehicle.passengerCount >= vehicle.capacity 
                                ? "Full" 
                                : "Book Ticket"}
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right panel - Map */}
        <div className="w-2/3 p-4">
          <div className="bg-white rounded-lg shadow-md h-full">
            <h2 className="text-lg font-semibold px-4 pt-4">Live Bus Tracker</h2>
            <div className="p-2 h-[calc(100%-2rem)]">
              <ClientOnly>
                <TransportMap 
                  bookedVehicleId={bookedVehicleId || undefined} 
                  showRoutes={true}
                />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 