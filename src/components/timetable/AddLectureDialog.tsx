import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"
import type { Timetable } from "../../types"

interface AddLectureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editEntry?: Timetable | null
  onClose?: () => void
}

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
const SUBJECT_COLORS = [
  "#2563EB", "#7C3AED", "#16A34A", "#DC2626", "#F59E0B",
  "#EC4899", "#06B6D4", "#8B5CF6", "#84CC16", "#F97316",
]

export default function AddLectureDialog({
  open,
  onOpenChange,
  editEntry,
  onClose,
}: AddLectureDialogProps) {
  const { subjects, timetable, addTimetableEntry } = useStore()

  const [subjectId, setSubjectId] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState("1")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [room, setRoom] = useState("")
  const [type, setType] = useState<"theory" | "lab" | "tutorial">("theory")
  const [color, setColor] = useState(SUBJECT_COLORS[0])
  const [semester, setSemester] = useState("3")
  const [error, setError] = useState("")

  const selectedSubject = subjects.find((s) => s.id === subjectId)

  useEffect(() => {
    if (editEntry) {
      setSubjectId(editEntry.subjectId)
      setSubjectName(editEntry.subjectName)
      setDayOfWeek(String(editEntry.dayOfWeek))
      setStartTime(editEntry.startTime)
      setEndTime(editEntry.endTime)
      setRoom(editEntry.room || "")
      setType(editEntry.type)
      setColor(editEntry.color)
      setSemester(String(editEntry.semester))
    }
  }, [editEntry])

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  function resetForm() {
    setSubjectId("")
    setSubjectName("")
    setDayOfWeek("1")
    setStartTime("09:00")
    setEndTime("10:00")
    setRoom("")
    setType("theory")
    setColor(SUBJECT_COLORS[0])
    setSemester("3")
    setError("")
  }

  function handleSubjectSelect(value: string) {
    setSubjectId(value)
    const sub = subjects.find((s) => s.id === value)
    if (sub) {
      setSubjectName(sub.name)
      setColor(sub.color)
    }
  }

  function hasOverlap(
    day: number,
    start: string,
    end: string,
    excludeId?: string
  ): boolean {
    if (!timetable) return false
    return timetable.some((e) => {
      if (!e) return false
      if (excludeId && e.id === excludeId) return false
      if (e.dayOfWeek !== day) return false
      return start < e.endTime && end > e.startTime
    })
  }

  async function handleSubmit() {
    setError("")

    const finalSubjectName = subjectId === "__custom__" ? subjectName : selectedSubject?.name || ""
    const finalSubjectId = subjectId === "__custom__" ? `custom-${Date.now()}` : subjectId

    if (!finalSubjectName) {
      setError("Please select or enter a subject")
      return
    }
    if (startTime >= endTime) {
      setError("End time must be after start time")
      return
    }

    const day = parseInt(dayOfWeek)
    if (isNaN(day) || day < 0 || day > 6) {
      setError("Invalid day selected")
      return
    }

    const isOverlap = hasOverlap(day, startTime, endTime, editEntry?.id)
    if (isOverlap) {
      setError("Time conflict detected with another lecture")
      return
    }

    const entry = {
      subjectId: finalSubjectId,
      subjectName: finalSubjectName,
      dayOfWeek: day,
      startTime,
      endTime,
      room: room || undefined,
      type,
      color,
      semester: parseInt(semester) || 3,
    }

    try {
      await addTimetableEntry(entry)
      onOpenChange(false)
      onClose?.()
    } catch (e) {
      setError("Failed to add lecture. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0 overflow-hidden">
        <div
          className="h-1.5 shrink-0"
          style={{ backgroundColor: color }}
        />

        <div className="p-6 pb-0">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {editEntry ? "Edit Lecture" : "Add Lecture"}
            </DialogTitle>
            <DialogDescription>
              {editEntry
                ? "Update the lecture details below."
                : "Fill in the details to add a new lecture to your timetable."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={handleSubjectSelect}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      {sub.name} ({sub.code})
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Plus className="h-3 w-3" />
                    Custom subject...
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {subjectId === "__custom__" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-2"
              >
                <Input
                  placeholder="Enter subject name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as typeof type)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" step="300" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="font-mono" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" step="300" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                placeholder="e.g. LT-1"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="semester">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all duration-150",
                    "ring-offset-2 ring-offset-background",
                    color === c
                      ? "ring-2 ring-foreground scale-110"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                >
                  <span className="sr-only">{c}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onClose?.()
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editEntry ? "Save Changes" : "Add Lecture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}