import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { useStore } from "../../stores/appStore"
import { Button } from "../ui/button"

interface AppLayoutProps {
  currentPath: string
  onNavigate: (href: string) => void
  children: React.ReactNode
}

export function AppLayout({ currentPath, onNavigate, children }: AppLayoutProps) {
  const error = useStore((s) => s.error)
  const loading = useStore((s) => s.loading)
  const retryConnection = useStore((s) => s.retryConnection)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        {error && (
          <div className="flex items-center gap-3 px-6 py-2 bg-destructive/10 border-b border-destructive/20 text-sm text-destructive">
            <span className="flex-1">{error}</span>
            <Button variant="outline" size="sm" onClick={retryConnection} disabled={loading} className="h-7 text-xs">
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}