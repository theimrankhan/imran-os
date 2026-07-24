import { useMemo } from "react"
import { motion } from "framer-motion"
import { CalendarRange, Clock, FileText } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"

const EXAM_TYPE_COLORS: Record<string, string> = {
  exam: "from-destructive/20 to-destructive/5 border-destructive/20",
  assignment: "from-warning/20 to-warning/5 border-warning/20",
  holiday: "from-success/20 to-success/5 border-success/20",
  personal: "from-accent/20 to-accent/5 border-accent/20",
}

const EXAM_TYPE_BADGES: Record<string, { label: string; variant: "destructive" | "warning" | "success" | "default" }> = {
  exam: { label: "Exam", variant: "destructive" },
  assignment: { label: "Assignment", variant: "warning" },
  holiday: { label: "Holiday", variant: "success" },
  personal: { label: "Personal", variant: "default" },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date)
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(dateStr)
  eventDate.setHours(0, 0, 0, 0)
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ExamSchedule() {
  const { events } = useStore()

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => e.type === "exam" || e.type === "assignment")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  return (
    <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <CalendarRange className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-base">Exams & Assignments</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredEvents.length} upcoming event{filteredEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CalendarRange className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No exams or assignments yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add them from the Calendar page
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEvents.map((event, idx) => {
                const daysUntil = getDaysUntil(event.date)
                const badge = EXAM_TYPE_BADGES[event.type] || EXAM_TYPE_BADGES.exam
                const gradient = EXAM_TYPE_COLORS[event.type] || EXAM_TYPE_COLORS.exam

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      "p-4 bg-gradient-to-r",
                      gradient
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {event.title}
                          </span>
                          <Badge
                            variant={badge.variant}
                            className="text-[10px] px-1.5 py-0 leading-none shrink-0"
                          >
                            {badge.label}
                          </Badge>
                        </div>

                        {event.subjectName && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {event.subjectName}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(event.date)}
                            {event.startTime && ` · ${event.startTime}`}
                            {event.endTime && ` - ${event.endTime}`}
                          </span>
                          {event.description && (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {event.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div
                          className={cn(
                            "text-xs font-semibold tabular-nums",
                            daysUntil <= 3
                              ? "text-destructive"
                              : daysUntil <= 7
                              ? "text-warning"
                              : "text-muted-foreground"
                          )}
                        >
                          {daysUntil === 0
                            ? "Today!"
                            : daysUntil === 1
                            ? "Tomorrow"
                            : `${daysUntil}d`}
                        </div>
                        <div className="text-[10px] text-muted-foreground/50 mt-0.5">
                          {daysUntil === 0 ? "" : "left"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}