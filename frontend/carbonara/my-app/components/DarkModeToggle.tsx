import React, { useState } from "react"
// Stub: Dark mode toggle for accessibility
export function DarkModeToggle() {
  const [dark, setDark] = useState(false)
  return <button onClick={() => setDark(!dark)}>{dark ? "Light Mode" : "Dark Mode"}</button>
}