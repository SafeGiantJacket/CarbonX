"use client"

import type React from "react"

interface ErrorScreenProps {
  error: string | null
  onRetry: () => void
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(220, 38, 38, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(220, 38, 38, 0.2) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="glass-morphism rounded-2xl p-8 text-center backdrop-blur-xl border border-destructive/20">
          <div className="w-20 h-20 bg-gradient-to-r from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
            <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent mb-4">
            Connection Failed
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            {error || "Unable to connect to the Carbon Ledger canister. Please check your configuration."}
          </p>

          <div className="space-y-6">
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl hover-lift transition-all duration-300 font-semibold shadow-lg hover:shadow-primary/25"
            >
              Retry Connection
            </button>

            <div className="glass-effect rounded-xl p-4 text-left">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Required Environment Variables:</p>
              <ul className="space-y-2 text-xs font-mono">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>INTERNET_IDENTITY_CANISTER_ID</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>VITE_LEDGER_CANISTER_ID</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>VITE_DFX_HOST</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
