import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  CalendarDays,
  Table2,
  UserCheck,
  FileText,
  BookOpen,
  Settings,
  ChevronLeft,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useStore } from "../../stores/appStore"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: CalendarDays, label: "Calendar", href: "/calendar" },
  { icon: Table2, label: "Timetable", href: "/timetable" },
  { icon: UserCheck, label: "Attendance", href: "/attendance" },
  { icon: FileText, label: "Notes", href: "/notes" },
  { icon: BookOpen, label: "Subjects", href: "/subjects" },
]

interface SidebarProps {
  currentPath: string
  onNavigate: (href: string) => void
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)

  return (
    <motion.aside
      layout
      className={cn(
        "h-screen sticky top-0 border-r flex flex-col bg-sidebar text-sidebar-foreground overflow-hidden",
        sidebarOpen ? "w-64" : "w-16"
      )}
      animate={{ width: sidebarOpen ? 256 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className={cn("flex items-center h-14 border-b border-sidebar-border shrink-0", sidebarOpen ? "px-4 justify-between" : "justify-center")}>
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-lg tracking-tight"
            >
              Imran OS
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors shrink-0"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronLeft size={18} className="rotate-180" />}
        </button>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.href

          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={cn(
                "flex items-center gap-3 w-full rounded-md transition-colors",
                sidebarOpen ? "px-3 py-2.5" : "justify-center py-3",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm truncate text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border py-2 px-2">
        <button
          onClick={() => onNavigate("/settings")}
          className={cn(
            "flex items-center gap-3 w-full rounded-md transition-colors",
            sidebarOpen ? "px-3 py-2.5" : "justify-center py-3",
            currentPath === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Settings size={20} />
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm truncate text-left"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}