"use client"

import type React from "react"
import { useState } from "react"

interface HeaderProps {
  currentPrincipal: string
  activeScreen: string
}

export const Header: React.FC<HeaderProps> = ({ currentPrincipal, activeScreen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Screen Title */}
        <div>
          <h2 className="text-xl font-bold text-card-foreground">{activeScreen}</h2>
        </div>

        {/* User Info & Controls */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse-green"></div>
            <span className="text-sm text-muted-foreground">Connected</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {currentPrincipal.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">Principal</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {currentPrincipal.slice(0, 8)}...{currentPrincipal.slice(-4)}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-popover-foreground">Connected Principal</p>
                  <p className="text-xs font-mono text-muted-foreground break-all mt-1">{currentPrincipal}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(currentPrincipal)}
                    className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    📋 Copy Principal ID
                  </button>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
