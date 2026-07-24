import { motion } from "framer-motion"
import { Clock, MapPin } from "lucide-react"
import { Badge } from "../ui/badge"

import { useStore } from "../../stores/appStore"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TodayClasses() {
  const { timetable } = useStore()
  const today = DAY_NAMES[new Date().getDay()]
  const dayIndex = new Date().getDay()

  const todayClasses = timetable
    .filter((entry) => entry.dayOfWeek === dayIndex)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (todayClasses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-[var(--color-card)] p-6 text-center"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">No classes scheduled for {today}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-[var(--color-card)]"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          Today&apos;s Classes
        </h2>
        <span className="text-xs text-[var(--color-muted-foreground)]">{today}</span>
      </div>
      <div className="px-5 pb-5 space-y-2">
        {todayClasses.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.005, x: 2 }}
            className="group flex items-center gap-4 rounded-lg border border-transparent p-3 transition-all hover:border-[var(--color-border)] hover:bg-[var(--color-secondary)]/50 cursor-pointer"
          >
            <div
              className="h-10 w-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-foreground)] truncate">
                  {entry.subjectName}
                </span>
                <Badge
                  variant={entry.type === "lab" ? "warning" : "secondary"}
                  className="capitalize text-[10px] px-1.5 py-0"
                >
                  {entry.type}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                  <Clock size={12} />
                  {entry.startTime} - {entry.endTime}
                </span>
                {entry.room && (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                    <MapPin size={12} />
                    {entry.room}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
