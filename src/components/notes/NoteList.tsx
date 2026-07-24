import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, FileText } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import NoteCard from "./NoteCard"
import { useStore } from "../../stores/appStore"
import type { Note } from "../../types"

interface NoteListProps {
  activeNoteId: string | null
  onSelectNote: (id: string) => void
  onCreateNote: () => void
}

export default function NoteList({ activeNoteId, onSelectNote, onCreateNote }: NoteListProps) {
  const { notes, subjects, updateNote, deleteNote } = useStore()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subjectName.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [notes, searchQuery])

  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {}
    for (const note of filteredNotes) {
      const key = note.subjectName
      if (!groups[key]) groups[key] = []
      groups[key].push(note)
    }
    return groups
  }, [filteredNotes])

  const subjectColors = useMemo(() => {
    const colors: Record<string, string> = {}
    for (const s of subjects) {
      colors[s.name] = s.color
    }
    return colors
  }, [subjects])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Notes</h2>
          <span className="text-xs text-muted-foreground tabular-nums">{notes.length}</span>
        </div>

        <Button onClick={onCreateNote} size="sm" className="w-full gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Note
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {Object.entries(groupedNotes).length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">
                {notes.length === 0 ? "No notes yet" : "No matching notes"}
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {Object.entries(groupedNotes).map(([subjectName, subjectNotes]) => (
              <motion.div
                key={subjectName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                <div className="flex items-center gap-2 px-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: subjectColors[subjectName] || "#64748B" }}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {subjectName}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {subjectNotes.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {subjectNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isActive={note.id === activeNoteId}
                      onClick={() => onSelectNote(note.id)}
                      onDelete={() => deleteNote(note.id)}
                      onToggleComplete={() =>
                        updateNote(note.id, { completed: !note.completed })
                      }
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}