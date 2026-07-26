import { useState, useEffect } from "react"
import { UserCheck, UserX, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"

interface QuickMarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  subjectName: string
  color: string
  dayOfWeek: number
  onMark: (data: { subjectId: string; date: Date; status: "present" | "absent" }) => void
}

function getLastOccurrence(dayOfWeek: number): Date {
  const today = new Date()
  const currentDay = today.getDay()
  let diff = dayOfWeek - currentDay
  if (diff > 0) diff -= 7
  const d = new Date(today)
  d.setDate(d.getDate() + diff)
  return d
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function QuickMarkDialog({
  open,
  onOpenChange,
  subjectId,
  subjectName,
  color,
  dayOfWeek,
  onMark,
}: QuickMarkDialogProps) {
  const [date, setDate] = useState(() => getLastOccurrence(dayOfWeek))

  useEffect(() => {
    if (open) setDate(getLastOccurrence(dayOfWeek))
  }, [open, dayOfWeek])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {subjectName}
          </DialogTitle>
          <DialogDescription>
            Mark attendance for {DAY_NAMES[dayOfWeek]}, {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 py-4">
          <Button
            className="flex-1 h-12 gap-2 text-sm font-semibold bg-green-600 hover:bg-green-700"
            onClick={() => { onMark({ subjectId, date, status: "present" }); onOpenChange(false) }}
          >
            <UserCheck className="h-5 w-5" />
            Present
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-12 gap-2 text-sm font-semibold"
            onClick={() => { onMark({ subjectId, date, status: "absent" }); onOpenChange(false) }}
          >
            <UserX className="h-5 w-5" />
            Absent
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          <Calendar className="h-3 w-3 inline mr-1" />
          Date auto-set to last {DAY_NAMES[dayOfWeek]}
        </p>
      </DialogContent>
    </Dialog>
  )
}
