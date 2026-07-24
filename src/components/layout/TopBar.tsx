import { Moon, Sun, Search, PanelLeftClose, PanelLeft } from "lucide-react"
import { getGreeting, getInitials } from "../../lib/utils"
import { useStore } from "../../stores/appStore"

export function TopBar() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const setSearchOpen = useStore((s) => s.setSearchOpen)

  const today = new Date()
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-foreground/60 hover:text-foreground"
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {getGreeting()}, Imran
          </p>
          <p className="text-xs text-muted-foreground">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-input bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span>⌘</span>K
          </kbd>
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-secondary transition-colors text-foreground/60 hover:text-foreground"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          {getInitials("Imran")}
        </div>
      </div>
    </header>
  )
}