import { useEffect, type ReactNode } from "react"
import { useStore } from "../stores/appStore"

export function SearchProvider({ children }: { children: ReactNode }) {
  const setSearchOpen = useStore((s) => s.setSearchOpen)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [setSearchOpen])

  return <>{children}</>
}