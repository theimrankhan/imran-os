
import { Plus, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"

interface TimetableHeaderProps {
  currentWeekStart: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onAddLecture: () => void
  semesterFilter: string
  onSemesterFilterChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

function getWeekRange(start: Date): string {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  const fmtFull: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }

  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString("en-US", fmt)} - ${end.toLocaleDateString("en-US", fmtFull)}`
  }
  return `${start.toLocaleDateString("en-US", fmt)} - ${end.toLocaleDateString("en-US", fmtFull)}`
}

export default function TimetableHeader({
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onAddLecture,
  semesterFilter,
  onSemesterFilterChange,
  typeFilter,
  onTypeFilterChange,
}: TimetableHeaderProps) {
  const { settings, updateSettings } = useStore()
  const showWeekends = settings.timetable?.showWeekends ?? false

  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Timetable
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your weekly class schedule
          </p>
        </div>
        <Button onClick={onAddLecture} size="xl" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Lecture
        </Button>
      </div>

      {/* Filters and controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Week navigation */}
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onPrevWeek}
            className="rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-3 text-sm font-medium min-w-[180px] text-center tabular-nums">
            {getWeekRange(currentWeekStart)}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNextWeek}
            className="rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Semester filter */}
        <div className="w-[140px]">
          <Select value={semesterFilter} onValueChange={onSemesterFilterChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  Semester {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type filter */}
        <div className="w-[140px]">
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="theory">Theory</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        {/* Toggle weekends */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateSettings({
              timetable: { ...settings.timetable, showWeekends: !showWeekends },
            })
          }
          className={cn(
            "gap-2 transition-colors",
            showWeekends && "border-primary/30 bg-primary/5 text-primary"
          )}
        >
          {showWeekends ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          {showWeekends ? "Weekends On" : "Weekends Off"}
        </Button>
      </div>
    </div>
  )
}