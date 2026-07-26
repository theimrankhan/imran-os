import { useState, useMemo, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus, FileText, Search, BookOpen,
  Clock, Pin, PinOff
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import NotebookWriter from "../components/notes/NotebookWriter"
import NoteCard from "../components/notes/NoteCard"
import NoteEmptyState from "../components/notes/NoteEmptyState"
import CreateNoteDialog from "../components/notes/CreateNoteDialog"
import PageListSidebar from "../components/notes/PageListSidebar"
import { useStore } from "../stores/appStore"
import { cn } from "../lib/utils"

export default function NotesPage() {
  const { notes, subjects, attendance, updateNote, deleteNote, addPageToNote, deletePageFromNote, duplicatePageInNote, reorderPagesInNote } = useStore()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("pinned-notes") || "[]")
    } catch { return [] }
  })
  const activeNote = notes.find((n) => n.id === activeNoteId)

  useEffect(() => {
    setCurrentPageIndex(0)
  }, [activeNoteId])

  const filteredNotes = useMemo(() => {
    let result = notes
    if (selectedSubjectId) {
      result = result.filter((n) => n.subjectId === selectedSubjectId)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subjectName.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [notes, selectedSubjectId, searchQuery])

  const subjectNotesCount = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const n of notes) {
      counts[n.subjectId] = (counts[n.subjectId] || 0) + 1
    }
    return counts
  }, [notes])

  const recentNotes = useMemo(() => {
    return [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  }, [notes])

  const pinnedNotes = useMemo(() => {
    return notes.filter((n) => pinnedIds.includes(n.id))
  }, [notes, pinnedIds])

  const handleSelectSubject = useCallback((id: string | null) => {
    setSelectedSubjectId(id)
    setActiveNoteId(null)
  }, [])

  const handleSelectNote = useCallback((id: string) => {
    setActiveNoteId(id)
  }, [])

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [id, ...prev]
      localStorage.setItem("pinned-notes", JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar — 15% */}
        {activeNote ? (
          <PageListSidebar
            note={activeNote}
            currentPageIndex={currentPageIndex}
            onSelectPage={setCurrentPageIndex}
            onAddPage={() => {
              const newIdx = activeNote.pages?.length || 0
              addPageToNote(activeNote.id)
              setCurrentPageIndex(newIdx)
            }}
            onDeletePage={(pageId) => deletePageFromNote(activeNote.id, pageId)}
            onDuplicatePage={(pageId) => duplicatePageInNote(activeNote.id, pageId)}
            onReorderPage={(pageId, dir) => reorderPagesInNote(activeNote.id, pageId, dir)}
            onClose={() => setActiveNoteId(null)}
          />
        ) : (
          <motion.div layout className="w-[15%] min-w-[180px] max-w-[240px] shrink-0 border-r bg-card overflow-hidden flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-3">
                {/* Subjects */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-1">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Subjects</h3>
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums">{subjects.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => handleSelectSubject(null)}
                      className={cn(
                        "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left transition-colors text-xs",
                        !selectedSubjectId ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                      )}
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate">All Notes</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{notes.length}</span>
                    </button>

                    {subjects.slice(0, 8).map((sub) => {
                      const att = attendance.find((a) => a.subjectId === sub.id)
                      const pct = att?.percentage ?? 0
                      const ncount = subjectNotesCount[sub.id] || 0
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectSubject(sub.id)}
                          className={cn(
                            "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left transition-colors text-xs",
                            selectedSubjectId === sub.id ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          )}
                        >
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                          <span className="flex-1 truncate">{sub.name}</span>
                          <span className={cn(
                            "text-[10px] font-semibold tabular-nums",
                            pct >= 75 ? "text-green-600" : pct >= 65 ? "text-amber-600" : "text-red-600"
                          )}>
                            {Math.round(pct)}%
                          </span>
                          {ncount > 0 && <span className="text-[10px] text-muted-foreground/40 tabular-nums">{ncount}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Pinned Notes */}
                {pinnedNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 mb-1">
                      <Pin className="h-3 w-3 text-muted-foreground" />
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pinned</h3>
                    </div>
                    <div className="space-y-0.5">
                      {pinnedNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => handleSelectNote(note.id)}
                          className={cn(
                            "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left transition-colors text-xs",
                            activeNoteId === note.id ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          )}
                        >
                          <BookOpen className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                          <span className="flex-1 truncate">{note.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); togglePin(note.id) }} className="p-0.5 rounded hover:bg-muted">
                            <PinOff className="h-2.5 w-2.5 text-muted-foreground/40" />
                          </button>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Notes */}
                <div>
                  <div className="flex items-center gap-1.5 px-2 mb-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</h3>
                  </div>
                  <div className="space-y-0.5">
                    {recentNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleSelectNote(note.id)}
                        className={cn(
                          "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left transition-colors text-xs",
                          activeNoteId === note.id ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        )}
                      >
                        <span className="flex-1 truncate">{note.title}</span>
                        <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                          {new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-2 border-t">
              <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="w-full gap-1.5 h-8 text-xs">
                <Plus className="h-3.5 w-3.5" />
                New Note
              </Button>
            </div>
          </motion.div>
        )}

        {/* Center — Notebook (70%) */}
        <motion.div layout className="flex-[7] min-w-0 flex flex-col bg-background">
          {activeNote ? (
            <NotebookWriter
              noteId={activeNoteId}
              currentPageIndex={currentPageIndex}
              onPageChange={setCurrentPageIndex}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-5 py-2.5 border-b bg-card shrink-0">
                <h2 className="text-sm font-semibold">
                  {selectedSubjectId
                    ? subjects.find((s) => s.id === selectedSubjectId)?.name || "Notes"
                    : "All Notes"}
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">{filteredNotes.length} notes</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredNotes.length > 0 ? (
                  <div className="p-4 space-y-1.5">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isActive={false}
                        onClick={() => handleSelectNote(note.id)}
                        onDelete={() => deleteNote(note.id)}
                        onToggleComplete={() => updateNote(note.id, { completed: !note.completed })}
                      />
                    ))}
                  </div>
                ) : (
                  <NoteEmptyState
                    hasNotes={notes.length > 0}
                    onCreateNote={() => setCreateDialogOpen(true)}
                  />
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <CreateNoteDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
