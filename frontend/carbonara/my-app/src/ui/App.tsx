"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { initActor } from "../lib/actor"
import { DashboardScreen } from "./screens/DashboardScreen"
import { BatchManagementScreen } from "./screens/BatchManagementScreen"
import { MarketplaceScreen } from "./screens/MarketplaceScreen"
import { PortfolioScreen } from "./screens/PortfolioScreen"
import { AdminScreen } from "./screens/AdminScreen"
import { AnalyticsScreen } from "./screens/AnalyticsScreen"
import { Sidebar } from "./components/Sidebar"
import { Header } from "./components/Header"
import { LoadingScreen } from "./components/LoadingScreen"
import { ErrorScreen } from "./components/ErrorScreen"

const SCREENS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "🏠",
    component: DashboardScreen,
    description: "Overview and key metrics",
  },
  {
    id: "batches",
    label: "Batch Management",
    icon: "🌱",
    component: BatchManagementScreen,
    description: "Issue and manage carbon credit batches",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "🏪",
    component: MarketplaceScreen,
    description: "Trade carbon credits",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: "💼",
    component: PortfolioScreen,
    description: "Your holdings and transactions",
  },
  {
    id: "admin",
    label: "Administration",
    icon: "⚙️",
    component: AdminScreen,
    description: "System management and verification",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📈",
    component: AnalyticsScreen,
    description: "Data insights and reporting",
  },
]

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("dashboard")
  const [actor, setActor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentPrincipal] = useState("z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe")

  useEffect(() => {
    const init = async () => {
      try {
        const actorInstance = await initActor()
        setActor(actorInstance)
        setError(null)
      } catch (error) {
        console.error("Failed to initialize actor:", error)
        setError("Failed to connect to Carbon Ledger canister. Please check your environment configuration.")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (error || !actor) {
    return <ErrorScreen error={error} onRetry={() => window.location.reload()} />
  }

  const ActiveComponent = SCREENS.find((screen) => screen.id === activeScreen)?.component || DashboardScreen

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/3 right-1/5 w-64 h-64 bg-secondary/2 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-transparent to-background/98 backdrop-blur-sm cyber-grid"></div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          screens={SCREENS}
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-out ${sidebarCollapsed ? "ml-16" : "ml-64"}`}
        >
          <Header
            currentPrincipal={currentPrincipal}
            activeScreen={SCREENS.find((s) => s.id === activeScreen)?.label || "Dashboard"}
          />

          {/* Screen Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="animate-slide-in">
              <div className="glass-morphism rounded-xl p-1 mb-6">
                <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-border/10 hover-lift">
                  <ActiveComponent actor={actor} currentPrincipal={currentPrincipal} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
