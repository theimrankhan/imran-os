import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface RouterContextType {
  path: string
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterContextType | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.hash.replace("#", "") || "/")

  const navigate = useCallback((newPath: string) => {
    window.location.hash = newPath
    setPath(newPath)
  }, [])

  window.addEventListener("hashchange", () => {
    setPath(window.location.hash.replace("#", "") || "/")
  })

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error("useRouter must be used within RouterProvider")
  return ctx
}