import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, BookOpen, Table2 } from "lucide-react"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"

export function GlobalSearch() {
  const { isSearchOpen, setSearchOpen, subjects, notes, timetable, setSearchQuery } = useStore()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false)
        setQuery("")
      }
    }
    if (isSearchOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isSearchOpen, setSearchOpen])

  const results = query.toLowerCase()
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
      ]
    : []

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter" && results[selectedIndex]) {
        setSearchOpen(false)
        setQuery("")
      }
    },
    [results, selectedIndex, setSearchOpen]
  )

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => { setSearchOpen(false); setQuery("") }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  placeholder="Search notes, subjects, topics..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSearchQuery(e.target.value) }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {query && results.length === 0 && (
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
                          {type === "subject" ? "Subjects" : type === "note" ? "Notes" : "Lectures"}
                        </div>
                        {items.map((item: any, _idx: number) => {
                          const globalIdx = results.indexOf(item)
                          return (
                            <button
                              key={item.id}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                globalIdx === selectedIndex ? "bg-secondary" : "hover:bg-secondary/50"
                              )}
                              onClick={() => { setSearchOpen(false); setQuery("") }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                {type === "subject" && <BookOpen className="w-4 h-4 text-accent" />}
                                {type === "note" && <FileText className="w-4 h-4 text-primary" />}
                                {type === "lecture" && <Table2 className="w-4 h-4 text-success" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{item.name || item.title || item.subjectName}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {item.code || (item.content ? item.content.slice(0, 60) : item.type || "")}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ))
                  })()}
                </div>
              )}

              {!query && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Search across all your academic content
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
