import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  UserCheck,
  TrendingUp,
  Calendar,
  Percent,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Target,
} from "lucide-react"
import { useStore } from "../stores/appStore"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Progress } from "../components/ui/progress"
import { Separator } from "../components/ui/separator"
import { cn } from "../lib/utils"
import AttendanceRing from "../components/dashboard/AttendanceRing"
import SubjectAttendanceCard from "../components/attendance/SubjectAttendanceCard"
import AttendancePredictions from "../components/attendance/AttendancePredictions"
import AttendanceTable from "../components/attendance/AttendanceTable"
import MarkAttendanceDialog from "../components/attendance/MarkAttendanceDialog"
import type { AttendanceRecord } from "../types"

function getOverallAttendance(attendance: { percentage: number }[]): number {
  if (attendance.length === 0) return 0
  const sum = attendance.reduce((acc, a) => acc + a.percentage, 0)
  return Math.round((sum / attendance.length) * 100) / 100
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

function generateSampleRecords(attendance: { subjectId: string; subjectName: string; total: number; present: number }[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  const now = new Date()
  const subjects = attendance.filter((a) => a.total > 0)

  subjects.forEach((subj) => {
    const presentCount = subj.present
    for (let i = 0; i < subj.total; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (subj.total - i) * 2)
      records.push({
        id: `${subj.subjectId}-${i}`,
        subjectId: subj.subjectId,
        date: date.toISOString().split("T")[0],
        status: i < presentCount ? "present" : "absent",
        lectureId: `LEC-${i + 1}`,
      })
    }
  })

  return records.sort((a, b) => b.date.localeCompare(a.date))
}

export default function AttendancePage() {
  const { attendance, subjects, updateAttendance } = useStore()
  const [records, setRecords] = useState<AttendanceRecord[]>(() => generateSampleRecords(attendance))
  const [activeTab, setActiveTab] = useState("overview")

  const overallPercent = getOverallAttendance(attendance)
  const totalPresent = attendance.reduce((s, a) => s + a.present, 0)
  const totalAbsent = attendance.reduce((s, a) => s + a.absent, 0)
  const totalClasses = attendance.reduce((s, a) => s + a.total, 0)

  const needOverall = useMemo(() => {
    const target = 75 / 100
    const need = Math.ceil((target * totalClasses - totalPresent) / (1 - target))
    return Math.max(0, need)
  }, [totalClasses, totalPresent])

  const canMissOverall = useMemo(() => {
    const target = 75 / 100
    const canMiss = Math.floor((totalPresent - target * totalClasses) / target)
    return Math.max(0, canMiss)
  }, [totalClasses, totalPresent])

  const atRiskSubjects = attendance.filter((a) => a.percentage < 75)
  const safeSubjects = attendance.filter((a) => a.percentage >= 75)

  const handleMarkAttendance = useCallback(
    (data: { subjectId: string; date: Date; status: "present" | "absent"; lecture?: string }) => {
      const subj = attendance.find((a) => a.subjectId === data.subjectId)
      if (!subj) return

      const newRecord: AttendanceRecord = {
        id: `manual-${Date.now()}`,
        subjectId: data.subjectId,
        date: data.date.toISOString().split("T")[0],
        status: data.status,
        lectureId: data.lecture,
      }

      setRecords((prev) => [newRecord, ...prev])

      const update = {
        total: subj.total + 1,
        present: data.status === "present" ? subj.present + 1 : subj.present,
        absent: data.status === "absent" ? subj.absent + 1 : subj.absent,
      }
      updateAttendance(data.subjectId, update)
    },
    [attendance, updateAttendance],
  )

  const tableRecords = useMemo(
    () =>
      records.map((r) => {
        const color = subjects.find((s) => s.id === r.subjectId)?.color || "#888"
        const subjectName = attendance.find((a) => a.subjectId === r.subjectId)?.subjectName || r.subjectId
        return { ...r, subjectName, color }
      }),
    [records, subjects, attendance],
  )

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Header */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
                  {getGreeting()}, Imran
                </h1>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Track and predict your attendance across all subjects
                </p>
              </div>
              <MarkAttendanceDialog subjects={subjects} onMark={handleMarkAttendance} />
            </div>
          </motion.section>

          {/* Overall Summary Card */}
          <motion.section variants={itemVariants}>
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-card)] to-[var(--color-card)] shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <AttendanceRing percentage={overallPercent} size={120} strokeWidth={8} />
                  </div>

                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-lg font-bold text-[var(--color-foreground)]">
                      Overall Attendance
                    </h2>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      Across {attendance.length} subjects
                    </p>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
                        <span className="text-sm">
                          <strong className="text-[var(--color-foreground)]">{totalPresent}</strong>
                          <span className="text-[var(--color-muted-foreground)]"> Present</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-destructive)]" />
                        <span className="text-sm">
                          <strong className="text-[var(--color-foreground)]">{totalAbsent}</strong>
                          <span className="text-[var(--color-muted-foreground)]"> Absent</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-[var(--color-muted-foreground)]" />
                        <span className="text-sm">
                          <strong className="text-[var(--color-foreground)]">{totalClasses}</strong>
                          <span className="text-[var(--color-muted-foreground)]"> Total</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block h-16" />

                  <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                    <div className="rounded-xl bg-[var(--color-secondary)]/60 p-3 text-center">
                      <Target size={16} className="mx-auto mb-1 text-[var(--color-primary)]" />
                      <p className="text-xs text-[var(--color-muted-foreground)]">Need to attend</p>
                      <p className="text-xl font-bold text-[var(--color-foreground)]">{needOverall}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">more classes</p>
                    </div>
                    <div className="rounded-xl bg-[var(--color-secondary)]/60 p-3 text-center">
                      <ClipboardCheck size={16} className="mx-auto mb-1 text-[var(--color-success)]" />
                      <p className="text-xs text-[var(--color-muted-foreground)]">Can miss</p>
                      <p className="text-xl font-bold text-[var(--color-foreground)]">{canMissOverall}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">classes</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
                      Target: 75%
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        overallPercent >= 75
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-destructive)]",
                      )}
                    >
                      {overallPercent >= 75 ? "On Track" : "Below Target"}
                    </span>
                  </div>
                  <Progress value={Math.min(overallPercent, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Quick Stats */}
          <motion.section
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-success)]/10">
                  <GraduationCap size={18} className="text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">Safe Subjects</p>
                  <p className="text-lg font-bold text-[var(--color-foreground)]">{safeSubjects.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-destructive)]/10">
                  <AlertTriangleIcon size={18} className="text-[var(--color-destructive)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">At Risk</p>
                  <p className="text-lg font-bold text-[var(--color-foreground)]">{atRiskSubjects.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-warning)]/10">
                  <Percent size={18} className="text-[var(--color-warning)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">Avg Attendance</p>
                  <p className="text-lg font-bold text-[var(--color-foreground)]">{overallPercent.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Tabs Section */}
          <motion.section variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="gap-1.5 text-xs">
                  <UserCheck size={14} />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="records" className="gap-1.5 text-xs">
                  <Calendar size={14} />
                  Records
                </TabsTrigger>
                <TabsTrigger value="predictions" className="gap-1.5 text-xs">
                  <TrendingUp size={14} />
                  Predictions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {atRiskSubjects.length > 0 && (
                  <div className="rounded-xl border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangleIcon size={16} className="text-[var(--color-destructive)]" />
                      <span className="text-sm font-semibold text-[var(--color-foreground)]">
                        Subjects Below Target
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {atRiskSubjects.map((s) => (
                        <Badge
                          key={s.subjectId}
                          variant="destructive"
                          className="text-xs"
                        >
                          {s.subjectName} ({s.percentage.toFixed(1)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attendance.map((subj) => (
                    <SubjectAttendanceCard
                      key={subj.subjectId}
                      subjectId={subj.subjectId}
                      subjectName={subj.subjectName}
                      total={subj.total}
                      present={subj.present}
                      absent={subj.absent}
                      percentage={subj.percentage}
                      color={subjects.find((s) => s.id === subj.subjectId)?.color || "#888"}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="records">
                <AttendanceTable
                  records={tableRecords}
                  subjects={subjects.map((s) => ({ id: s.id, name: s.name, color: s.color }))}
                />
              </TabsContent>

              <TabsContent value="predictions">
                <AttendancePredictions
                  subjects={attendance.map((a) => ({
                    subjectId: a.subjectId,
                    subjectName: a.subjectName,
                    total: a.total,
                    present: a.present,
                    absent: a.absent,
                    percentage: a.percentage,
                    color: subjects.find((s) => s.id === a.subjectId)?.color || "#888",
                  }))}
                />
              </TabsContent>
            </Tabs>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}

function AlertTriangleIcon(props: { size?: number; className?: string }) {
  return (
    <svg
      width={props.size || 16}
      height={props.size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}