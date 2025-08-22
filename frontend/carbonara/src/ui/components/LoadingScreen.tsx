"use client"

import type React from "react"

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(249, 115, 22, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 115, 22, 0.2) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-muted/30 rounded-full animate-spin border-t-primary mx-auto animate-glow"></div>
          <div
            className="absolute inset-2 w-20 h-20 border-2 border-accent/50 rounded-full animate-spin mx-auto"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute inset-4 w-16 h-16 border border-secondary/30 rounded-full animate-spin mx-auto"
            style={{ animationDuration: "4s" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse-orange"></div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-8 max-w-md mx-auto backdrop-blur-xl">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Initializing CarbonX
          </h2>
          <p className="text-muted-foreground mb-6 text-lg">Connecting to carbon credit ledger...</p>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>

          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent animate-shimmer rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
