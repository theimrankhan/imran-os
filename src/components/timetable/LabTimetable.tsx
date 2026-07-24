import { motion } from "framer-motion"
import { Beaker, Clock, MapPin } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"

const DAY_LABELS_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
]

export default function LabTimetable() {
  const { timetable } = useStore()
  const labEntries = timetable.filter((e) => e.type === "lab")

  const grouped: Record<string, typeof labEntries> = {}
  labEntries.forEach((entry) => {
    const day = DAY_LABELS_FULL[entry.dayOfWeek]
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(entry)
  })

  const sortedDays = Object.entries(grouped).sort((a, b) => {
    const dayA = DAY_LABELS_FULL.indexOf(a[0])
    const dayB = DAY_LABELS_FULL.indexOf(b[0])
    return dayA - dayB
  })

  return (
    <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Beaker className="h-4 w-4 text-success" />
          </div>
          <div>
            <CardTitle className="text-base">Lab Sessions</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {labEntries.length} lab{labEntries.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          {sortedDays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Beaker className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No lab sessions scheduled</p>
            </div>
          ) : (
            <div className="divide-y">
              {sortedDays.map(([day, entries]) => (
                <div key={day} className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {day}
                  </h4>
                  <div className="space-y-2">
                    {entries
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((entry, idx) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "flex items-start gap-3 rounded-lg p-3",
                            "border border-success/20 bg-success/[0.04]",
                            "hover:bg-success/[0.08] transition-colors"
                          )}
                        >
                          <div
                            className="h-full w-1 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: entry.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground truncate">
                                {entry.subjectName}
                              </span>
                              <Badge
                                variant="success"
                                className="text-[10px] px-1.5 py-0 leading-none shrink-0"
                              >
                                Lab
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground/70">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.startTime} - {entry.endTime}
                              </span>
                              {entry.room && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {entry.room}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}