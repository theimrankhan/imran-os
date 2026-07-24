import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, FileText, PenTool, RefreshCw, Zap, Search, Download } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"
import { PageContainer } from "../components/layout/PageContainer"
import NoteEditor from "../components/notes/NoteEditor"
import NoteList from "../components/notes/NoteList"
import NoteEmptyState from "../components/notes/NoteEmptyState"
import CreateNoteDialog from "../components/notes/CreateNoteDialog"
import { useStore } from "../stores/appStore"

const typeIcons = {
  normal: FileText,
  handwritten: PenTool,
  revision: RefreshCw,
  quick: Zap,
}

export default function NotesPage() {
  const { notes, updateNote } = useStore()
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const activeNote = notes.find((n) => n.id === activeNoteId)

  function handleExportPDF() {
    if (!activeNote) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeNote.title}</title>
          <style>
            body { font-family: Inter, system-ui, sans-serif; padding: 40px; line-height: 1.6; color: #1a1a2e; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
            img { max-width: 100%; border-radius: 8px; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
            blockquote { border-left: 3px solid #2563eb; padding-left: 16px; margin-left: 0; color: #555; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${activeNote.title}</h1>
          <div class="meta">
            ${activeNote.subjectName} · Lecture ${activeNote.lectureNumber} · ${new Date(activeNote.createdAt).toLocaleDateString()}
            ${activeNote.tags.length ? ` · Tags: ${activeNote.tags.join(", ")}` : ""}
          </div>
          ${activeNote.content}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <PageContainer
      title="Notes"
      description="Create and manage your study notes"
      actions={
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="handwritten">Handwritten</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
              <SelectItem value="quick">Quick</SelectItem>
            </SelectContent>
          </Select>
          {activeNote && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon-sm" onClick={handleExportPDF}>
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export PDF</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-12rem)] -mx-6 -mb-6">
        <motion.div
          layout
          className="w-72 shrink-0 border-r bg-card overflow-hidden"
        >
          <NoteList
            activeNoteId={activeNoteId}
            onSelectNote={setActiveNoteId}
            onCreateNote={() => setCreateDialogOpen(true)}
          />
        </motion.div>

        <motion.div layout className="flex-1 flex flex-col min-w-0 bg-background">
          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div
                key={activeNote.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg p-1.5 bg-primary/10">
                      {(() => {
                        const Icon = typeIcons[activeNote.type]
                        return <Icon className="w-4 h-4 text-primary" />
                      })()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {activeNote.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {activeNote.subjectName} · Lecture {activeNote.lectureNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant={activeNote.completed ? "success" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateNote(activeNote.id, { completed: !activeNote.completed })
                      }
                      className="text-xs"
                    >
                      {activeNote.completed ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>
                </div>
                <NoteEditor noteId={activeNoteId} />
              </motion.div>
            ) : (
              <NoteEmptyState
                hasNotes={notes.length > 0}
                onCreateNote={() => setCreateDialogOpen(true)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <CreateNoteDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </PageContainer>
  )
}