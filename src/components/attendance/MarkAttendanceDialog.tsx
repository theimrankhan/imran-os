import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar as CalendarIcon, Plus, UserCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { cn } from "../../lib/utils"

interface SubjectOption {
  id: string
  name: string
  color: string
}

interface MarkAttendanceDialogProps {
  subjects: SubjectOption[]
  onMark: (data: {
    subjectId: string
    date: Date
    status: "present" | "absent"
    lecture?: string
  }) => void
}

export default function MarkAttendanceDialog({ subjects, onMark }: MarkAttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [subjectId, setSubjectId] = useState("")
  const [status, setStatus] = useState<"present" | "absent">("present")
  const [lecture, setLecture] = useState("")

  const handleSubmit = () => {
    if (!subjectId) return
    onMark({ subjectId, date, status, lecture: lecture || undefined })
    setLecture("")
    setStatus("present")
    setSubjectId("")
    setDate(new Date())
    setOpen(false)
  }

  const selectedSubject = subjects.find((s) => s.id === subjectId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="h-8 text-xs gap-1.5">
          <Plus size={14} />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck size={18} className="text-[var(--color-primary)]" />
            Mark Attendance
          </DialogTitle>
          <DialogDescription>
            Record your attendance for a lecture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon size={14} className="mr-2" />
                  {date
                    ? date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={status === "present" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 text-xs h-9",
                  status === "present" && "bg-[var(--color-success)] hover:bg-[var(--color-success)]/90",
                )}
                onClick={() => setStatus("present")}
              >
                Present
              </Button>
              <Button
                type="button"
                variant={status === "absent" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 text-xs h-9",
                  status === "absent" && "bg-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/90",
                )}
                onClick={() => setStatus("absent")}
              >
                Absent
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lecture">Lecture Reference (optional)</Label>
            <input
              id="lecture"
              value={lecture}
              onChange={(e) => setLecture(e.target.value)}
              placeholder="e.g. Lecture 12, Topic: Arrays"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {selectedSubject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-lg bg-[var(--color-secondary)]/50 p-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: selectedSubject.color }}
                />
                <span className="text-xs font-medium text-[var(--color-foreground)]">
                  {selectedSubject.name}
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                Marking as <strong>{status === "present" ? "Present" : "Absent"}</strong> on{" "}
                {date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!subjectId}
            className="gap-1.5"
          >
            <UserCheck size={14} />
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}