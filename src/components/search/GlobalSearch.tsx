import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, BookOpen, Table2, CalendarDays, UserCheck, Sun, Moon, Plus, Sparkles, Command } from "lucide-react"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"

const commands = [
  { id: "note", icon: Plus, label: "Create Note", action: "create-note", shortcut: "N" },
  { id: "calendar", icon: CalendarDays, label: "Open Calendar", action: "navigate", shortcut: "C" },
  { id: "timetable", icon: Table2, label: "Open Timetable", action: "navigate", shortcut: "T" },
  { id: "attendance", icon: UserCheck, label: "Mark Attendance", action: "mark-attendance", shortcut: "A" },
  { id: "theme", icon: Sun, label: "Toggle Theme", action: "toggle-theme", shortcut: "D" },
  { id: "handwritten", icon: Sparkles, label: "Generate Handwritten PDF", action: "handwritten", shortcut: "H" },
]

export function GlobalSearch() {
  const { isSearchOpen, setSearchOpen, subjects, notes, timetable, events, setSearchQuery, theme, setTheme } = useStore()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mode, setMode] = useState<"search" | "commands">("search")

  function handleClose() {
    setSearchOpen(false)
    setQuery("")
    setMode("search")
  }

  const handleCommand = useCallback((action: string) => {
    handleClose()
    switch (action) {
      case "toggle-theme":
        setTheme(theme === "dark" ? "light" : "dark")
        break
      case "create-note":
        window.location.hash = "/notes"
        break
      case "navigate":
        window.location.hash = "/timetable"
        break
      case "mark-attendance":
        window.location.hash = "/attendance"
        break
      case "handwritten":
        window.location.hash = "/notes"
        break
    }
  }, [theme, setTheme, handleClose])

  const searchResults = query.trim()
    ? [
        ...subjects
          .filter((s) => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query))
          .map((s) => ({ ...s, _type: "subject" as const })),
        ...notes
          .filter((n) => n.title.toLowerCase().includes(query) || n.content?.toLowerCase().includes(query))
          .map((n) => ({ ...n, _type: "note" as const })),
        ...timetable
          .filter((t) => t.subjectName.toLowerCase().includes(query))
          .map((t) => ({ ...t, _type: "lecture" as const })),
        ...events
          .filter((e) => e.title.toLowerCase().includes(query))
          .map((e) => ({ ...e, _type: "event" as const })),
      ]
    : []

  const filteredCommands = commands.filter(
    (c) => !query || c.label.toLowerCase().includes(query.toLowerCase())
  )

  const results = query.startsWith("/")
    ? []
    : mode === "commands"
      ? []
      : searchResults

  const showCommands = query.startsWith("/") || filteredCommands.length > 0

  function handleSelect(item: any) {
    handleClose()
    if (item._type === "subject") window.location.hash = "/subjects"
    else if (item._type === "note") window.location.hash = "/notes"
    else if (item._type === "lecture") window.location.hash = "/timetable"
    else if (item._type === "event") window.location.hash = "/calendar"
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[12%] -translate-x-1/2 w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  placeholder="Search or type / for commands..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setMode(e.target.value.startsWith("/") ? "commands" : "search")
                    setSearchQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Command className="h-2.5 w-2.5" />
                  K
                </kbd>
              </div>

              {/* Commands */}
              {query.startsWith("/") && (
                <div className="p-2">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Commands
                  </div>
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-secondary/50"
                      onClick={() => handleCommand(cmd.action)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <cmd.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{cmd.label}</div>
                      </div>
                      <kbd className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5">
                        {cmd.shortcut}
                      </kbd>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state - no query */}
              {!query && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <Command className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Commands</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {commands.slice(0, 6).map((cmd) => (
                      <button
                        key={cmd.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-secondary/50 text-xs"
                        onClick={() => handleCommand(cmd.action)}
                      >
                        <cmd.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{cmd.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {query && !query.startsWith("/") && results.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}

              {results.length > 0 && (
                <div className="max-h-80 overflow-y-auto p-2">
                  {(() => {
                    const groups: Record<string, typeof results> = {}
                    results.forEach((r) => {
                      const g = r._type
                      if (!groups[g]) groups[g] = []
                      groups[g].push(r)
                    })
                    return Object.entries(groups).map(([type, items]) => (
                      <div key={type}>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {type === "subject" ? "Subjects" : type === "note" ? "Notes" : type === "lecture" ? "Lectures" : "Events"}
                        </div>
                        {items.map((item: any) => (
                          <button
                            key={item.id}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                              "hover:bg-secondary/50"
                            )}
                            onClick={() => handleSelect(item)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              {type === "subject" && <BookOpen className="w-4 h-4" />}
                              {type === "note" && <FileText className="w-4 h-4" />}
                              {type === "lecture" && <Table2 className="w-4 h-4" />}
                              {type === "event" && <CalendarDays className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {item.name || item.title || item.subjectName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.code || (item.content ? item.content.slice(0, 60) : item.type || "")}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
