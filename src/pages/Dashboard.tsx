import { motion } from "framer-motion"
import {
  Calendar,
  NotebookPen,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  Clock,
  FileWarning,
  ArrowUpRight,
} from "lucide-react"
import StatsCard from "../components/dashboard/StatsCard"
import AttendanceRing from "../components/dashboard/AttendanceRing"
import ActionCard from "../components/dashboard/ActionCard"
import TodayClasses from "../components/dashboard/TodayClasses"
import AIRecommendations from "../components/dashboard/AIRecommendations"
import RecentNotes from "../components/dashboard/RecentNotes"
import { useStore } from "../stores/appStore"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function getOverallAttendance(attendance: { percentage: number }[]): number {
  if (attendance.length === 0) return 0
  const sum = attendance.reduce((acc, a) => acc + a.percentage, 0)
  return Math.round((sum / attendance.length) * 100) / 100
}

function getPendingNotes(notes: { completed: boolean }[]): number {
  return notes.filter((n) => !n.completed).length
}

function getNextClass(
  timetable: { dayOfWeek: number; startTime: string; subjectName: string; room?: string; color: string }[]
) {
  const now = new Date()
  const currentDay = now.getDay()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const todayClasses = timetable
    .filter((e) => e.dayOfWeek === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const upcoming = todayClasses.find((e) => {
    const [h, m] = e.startTime.split(":").map(Number)
    return h * 60 + m > currentMinutes
  })

  if (upcoming) return upcoming

  const nextDay = (currentDay + 1) % 7
  const nextClasses = timetable
    .filter((e) => e.dayOfWeek === nextDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (nextClasses.length > 0) return nextClasses[0]

  return null
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { attendance, timetable, notes } = useStore()

  const overallAttendance = getOverallAttendance(attendance)
  const today = new Date()
  const todayClassesCount = timetable.filter((e) => e.dayOfWeek === today.getDay()).length
  const pendingNotes = getPendingNotes(notes)
  const nextClass = getNextClass(timetable)

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Hero / Greeting */}
          <motion.section variants={itemVariants}>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
                {getGreeting()}, Imran
              </h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Here&apos;s your academic overview for today
              </p>
              <p className="text-xs font-medium text-[var(--color-muted-foreground)]/70">
                {formatDateFull(today)}
              </p>
            </div>
          </motion.section>

          {/* Stats Grid */}
          <motion.section
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatsCard
              icon={GraduationCap}
              label="Attendance"
              value={`${overallAttendance}%`}
              subtext={`Across ${attendance.length} subjects`}
              trend={overallAttendance >= 75 ? "up" : overallAttendance >= 60 ? "neutral" : "down"}
              color="var(--color-success)"
            >
              <AttendanceRing percentage={overallAttendance} size={64} strokeWidth={5} />
            </StatsCard>

            <StatsCard
              icon={BookOpen}
              label="Today's Classes"
              value={todayClassesCount}
              subtext={todayClassesCount === 1 ? "class scheduled" : "classes scheduled"}
              color="var(--color-primary)"
            />

            <StatsCard
              icon={FileWarning}
              label="Pending Notes"
              value={pendingNotes}
              subtext={notes.length > 0 ? `${notes.length} total notes` : "No notes yet"}
              trend={pendingNotes > 0 ? "down" : "neutral"}
              color="var(--color-warning)"
            />

            <StatsCard
              icon={Clock}
              label="Upcoming"
              value={nextClass ? nextClass.subjectName : "—"}
              subtext={
                nextClass
                  ? `${nextClass.startTime}${nextClass.room ? ` · ${nextClass.room}` : ""}`
                  : "No upcoming classes"
              }
              color="var(--color-accent)"
            />
          </motion.section>

          {/* Main Grid: Classes + AI */}
          <motion.section
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <TodayClasses />
            </div>
            <div>
              <AIRecommendations />
            </div>
          </motion.section>

          {/* Recent Notes */}
          <motion.section variants={itemVariants}>
            <RecentNotes />
          </motion.section>

          {/* Quick Actions */}
          <motion.section variants={itemVariants}>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ActionCard
                  icon={NotebookPen}
                  label="Create Notes"
                  accent
                  onClick={() => {}}
                />
                <ActionCard
                  icon={Calendar}
                  label="Open Calendar"
                  onClick={() => {}}
                />
                <ActionCard
                  icon={ClipboardCheck}
                  label="Mark Attendance"
                  onClick={() => {}}
                />
                <ActionCard
                  icon={ArrowUpRight}
                  label="Continue Notes"
                  onClick={() => {}}
                />
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}
