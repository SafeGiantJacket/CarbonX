"use client"

import type React from "react"
import { useState } from "react"

interface SidebarProps {
  screens: Array<{
    id: string
    label: string
    icon: string
    component: React.ComponentType<any>
  }>
  activeScreen: string
  onScreenChange: (screenId: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  screens,
  activeScreen,
  onScreenChange,
  collapsed,
  onToggleCollapse,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">🌱</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">CarbonX</h1>
              <p className="text-xs text-sidebar-foreground/70">Carbon Trading Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => onScreenChange(screen.id)}
              onMouseEnter={() => setHoveredItem(screen.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 relative group ${
                activeScreen === screen.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <span className="text-lg flex-shrink-0">{screen.icon}</span>
              {!collapsed && <span className="font-medium text-sm">{screen.label}</span>}

              {/* Tooltip for collapsed state */}
              {collapsed && hoveredItem === screen.id && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg whitespace-nowrap z-50">
                  {screen.label}
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <span className="text-lg">{collapsed ? "→" : "←"}</span>
        </button>
      </div>
    </div>
  )
}
