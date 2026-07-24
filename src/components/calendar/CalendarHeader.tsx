import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"


interface CalendarHeaderProps {
  currentDate: Date
  view: "month" | "week" | "day"
  onViewChange: (view: "month" | "week" | "day") => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const title =
    view === "day"
      ? `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
      : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground min-w-[200px]">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onPrev} className="text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onNext} className="text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="text-xs font-medium h-8"
        >
          Today
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => onViewChange(v as "month" | "week" | "day")}>
        <TabsList className="h-9">
          <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
          <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
          <TabsTrigger value="day" className="text-xs px-3">Day</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}