import type { ReactNode } from "react"
import { ThemeProvider } from "./ThemeProvider"
import { SearchProvider } from "./SearchProvider"
import { TooltipProvider } from "../components/ui/tooltip"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ThemeProvider>
        <SearchProvider>
          {children}
        </SearchProvider>
      </ThemeProvider>
    </TooltipProvider>
  )
}