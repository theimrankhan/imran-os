import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useStore } from "../../stores/appStore"
import type { Note } from "../../types"

interface CreateNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const noteTypes: { value: Note["type"]; label: string; description: string }[] = [
  { value: "normal", label: "Normal", description: "Standard lecture notes" },
  { value: "revision", label: "Revision", description: "Summary & revision material" },
  { value: "quick", label: "Quick", description: "Quick thoughts & ideas" },
]

export default function CreateNoteDialog({ open, onOpenChange }: CreateNoteDialogProps) {
  const { subjects, addNote } = useStore()

  const [subjectId, setSubjectId] = useState("")
  const [lectureNumber, setLectureNumber] = useState("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<Note["type"]>("normal")
  const [tagsInput, setTagsInput] = useState("")

  const selectedSubject = subjects.find((s) => s.id === subjectId)

  function handleCreate() {
    if (!subjectId || !selectedSubject) return

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const now = new Date().toISOString()

    const newNote: Note = {
      id: crypto.randomUUID(),
      subjectId,
      subjectName: selectedSubject.name,
      lectureNumber: lectureNumber ? parseInt(lectureNumber, 10) : 0,
      title: title || "Untitled Note",
      content: "",
      type,
      tags,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }

    addNote(newNote)
    handleReset()
    onOpenChange(false)
  }

  function handleReset() {
    setSubjectId("")
    setLectureNumber("")
    setTitle("")
    setType("normal")
    setTagsInput("")
  }

  const isValid = subjectId && title.trim()

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new study note
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Lecture #</label>
                    <Input
                      type="number"
                      placeholder="e.g. 12"
                      value={lectureNumber}
                      onChange={(e) => setLectureNumber(e.target.value)}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Note Type</label>
                    <Select value={type} onValueChange={(v) => setType(v as Note["type"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {noteTypes.map((nt) => (
                          <SelectItem key={nt.value} value={nt.value}>
                            {nt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    placeholder="Note title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tags</label>
                  <Input
                    placeholder="e.g. java, inheritance, oop"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!isValid}>
                  Create Note
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}