import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText, Plus, MoreHorizontal, Trash2, Copy,
  ArrowUp, ArrowDown, ChevronLeft,
  CheckCircle2, RefreshCw, Sparkles, Circle, AlertTriangle,
} from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import type { NotebookPage, Note } from "../../types"

interface PageListSidebarProps {
  note: Note
  currentPageIndex: number
  onSelectPage: (index: number) => void
  onAddPage: () => void
  onDeletePage: (pageId: string) => void
  onDuplicatePage: (pageId: string) => void
  onReorderPage: (pageId: string, direction: "up" | "down") => void
  onClose: () => void
}

const statusConfig: Record<string, { icon: typeof FileText; color: string; bg: string; label: string }> = {
  blank: { icon: Circle, color: "text-muted-foreground/40", bg: "bg-transparent", label: "Blank" },
  "in-progress": { icon: FileText, color: "text-primary", bg: "bg-primary/10", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10", label: "Completed" },
  "needs-revision": { icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-500/10", label: "Needs Revision" },
  "ai-generated": { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-500/10", label: "AI Generated" },
}

export default function PageListSidebar({
  note, currentPageIndex, onSelectPage, onAddPage,
  onDeletePage, onDuplicatePage, onReorderPage, onClose,
}: PageListSidebarProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const pages = note.pages || []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[15%] min-w-[180px] max-w-[240px] shrink-0 border-r bg-card overflow-hidden flex flex-col"
    >
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>
        <div className="mt-2">
          <h3 className="text-xs font-semibold text-foreground truncate">{note.title}</h3>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {note.subjectName} · L{note.lectureNumber}
          </p>
        </div>
      </div>

      <div className="px-2 py-1.5 border-b border-border/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pages
          </span>
          <span className="text-[10px] text-muted-foreground/60 tabular-nums">{pages.length}</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1.5 space-y-0.5">
          {pages.map((page, idx) => {
            const statusInfo = statusConfig[page.status] || statusConfig["in-progress"]
            const StatusIcon = statusInfo.icon
            const isActive = idx === currentPageIndex

            return (
              <div
                key={page.id}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                onClick={() => { onSelectPage(idx); setMenuOpen(null) }}
              >
                <div className={cn("rounded p-0.5 shrink-0", isActive ? statusInfo.bg : "")}>
                  <StatusIcon className={cn("h-3 w-3", isActive ? statusInfo.color : "text-muted-foreground/40")} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">{page.pageNumber}.</span>
                    <span className="text-xs font-medium truncate">{page.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted-foreground/40 tabular-nums">{page.wordCount}w</span>
                    <span className="text-[10px] text-muted-foreground/30">·</span>
                    <span className={cn("text-[10px]", isActive ? statusInfo.color : "text-muted-foreground/40")}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === page.id ? null : page.id) }}
                    className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>
                  {menuOpen === page.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 top-full mt-1 w-40 p-1 rounded-xl border bg-card shadow-xl z-30"
                    >
                      <button onClick={(e) => { e.stopPropagation(); onDuplicatePage(page.id); setMenuOpen(null) }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-muted text-left">
                        <Copy className="h-3 w-3" /> Duplicate
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onReorderPage(page.id, "up"); setMenuOpen(null) }}
                        disabled={idx <= 0}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-muted text-left disabled:opacity-30">
                        <ArrowUp className="h-3 w-3" /> Move Up
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onReorderPage(page.id, "down"); setMenuOpen(null) }}
                        disabled={idx >= pages.length - 1}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-muted text-left disabled:opacity-30">
                        <ArrowDown className="h-3 w-3" /> Move Down
                      </button>
                      {pages.length > 1 && (
                        <>
                          <div className="border-t border-border/50 my-1" />
                          <button onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); setMenuOpen(null) }}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left">
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-2 border-t">
        <Button onClick={onAddPage} size="sm" className="w-full gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New Page
        </Button>
      </div>
    </motion.div>
  )
}
