"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import ClientOnly from "@/components/client-only"
import TransportMap from "@/components/transport-map"
import Navigation from "@/components/navigation"

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />
      
      <div className="flex-1">
        {/* Hero section */}
        <section className="bg-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Smart Transport for Panvel
                </h1>
                <p className="text-xl mb-8">
                  An intelligent transportation system that optimizes routes, predicts traffic, and improves passenger experience.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/admin"
                    className="bg-white text-blue-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                  >
                    Admin Portal
                  </Link>
                  <Link
                    href="/passenger"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium border border-white hover:bg-blue-700 transition"
                  >
                    Passenger Portal
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
                <ClientOnly>
                  <TransportMap showRoutes={true} />
                </ClientOnly>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Route Optimization"
                description="Automatically detects congestion and suggests alternative routes to save time and fuel."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
              />
              <FeatureCard
                title="Traffic Prediction"
                description="Uses historical data and current conditions to predict traffic patterns for better planning."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <FeatureCard
                title="Passenger Tracking"
                description="Track your booked bus in real-time with accurate ETAs and vehicle status information."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1 1 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>
        
        {/* Portal Showcase section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Portals</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PortalCard
                title="Admin Portal"
                description="Manage routes, view live traffic data, and get intelligent optimization recommendations."
                features={[
                  "Route optimization with diversion visualization",
                  "Traffic prediction for next 6 hours",
                  "Resource allocation recommendations",
                  "Real-time vehicle tracking and status"
                ]}
                linkHref="/admin"
                linkText="Go to Admin Portal"
                bgColor="bg-blue-50"
                accentColor="border-blue-500"
                buttonColor="bg-blue-600 hover:bg-blue-700"
              />
              
              <PortalCard
                title="Passenger Portal"
                description="Find buses, book tickets, and track your bus in real-time."
                features={[
                  "Real-time bus tracking",
                  "Online ticket booking",
                  "Live ETA updates",
                  "Route and diversion information"
                ]}
                linkHref="/passenger"
                linkText="Go to Passenger Portal"
                bgColor="bg-green-50"
                accentColor="border-green-500"
                buttonColor="bg-green-600 hover:bg-green-700"
              />
            </div>
          </div>
        </section>
      </div>
      
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2023 Smart Transport System. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about" className="hover:text-blue-400">About</Link>
              <Link href="/contact" className="hover:text-blue-400">Contact</Link>
              <Link href="/privacy" className="hover:text-blue-400">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

interface PortalCardProps {
  title: string
  description: string
  features: string[]
  linkHref: string
  linkText: string
  bgColor: string
  accentColor: string
  buttonColor: string
}

function PortalCard({
  title,
  description,
  features,
  linkHref,
  linkText,
  bgColor,
  accentColor,
  buttonColor,
}: PortalCardProps) {
  return (
    <div className={`${bgColor} p-6 rounded-lg shadow-md border-l-4 ${accentColor}`}>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{description}</p>
      
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500 mr-2 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      
      <Link
        href={linkHref}
        className={`${buttonColor} text-white px-4 py-2 rounded font-medium inline-block transition-colors`}
      >
        {linkText}
      </Link>
    </div>
  )
}

