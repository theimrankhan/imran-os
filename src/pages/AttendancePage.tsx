import { useState, useMemo, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import {
  UserCheck, TrendingUp, Calendar, Percent, GraduationCap,
  BookOpen, ClipboardCheck, Target, AlertTriangle,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Minus
} from "lucide-react"
import { useStore } from "../stores/appStore"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { ScrollArea } from "../components/ui/scroll-area"
import { cn } from "../lib/utils"
import ProgressRing from "../components/timetable/ProgressRing"
import SubjectAttendanceCard from "../components/attendance/SubjectAttendanceCard"
import AttendancePredictions from "../components/attendance/AttendancePredictions"
import AttendanceTable from "../components/attendance/AttendanceTable"
import MarkAttendanceDialog from "../components/attendance/MarkAttendanceDialog"
import TimetableAttendanceView from "../components/attendance/TimetableAttendanceView"
import type { AttendanceRecord } from "../types"

function getOverallAttendance(attendance: { percentage: number }[]): number {
  if (attendance.length === 0) return 0
  const sum = attendance.reduce((acc, a) => acc + a.percentage, 0)
  return Math.round((sum / attendance.length) * 100) / 100
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
  const [activeTab, setActiveTab] = useState("quick")

  useEffect(() => {
    setRecords((prev) => {
      const existing = new Set(prev.map((r) => r.id))
      const newRecords = generateSampleRecords(attendance).filter((r) => !existing.has(r.id))
      return newRecords.length > 0 ? [...newRecords, ...prev] : prev
    })
  }, [attendance])

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

  const sortedSubjects = useMemo(() => {
    return [...attendance].sort((a, b) => a.percentage - b.percentage)
  }, [attendance])

  const atRiskSubjects = attendance.filter((a) => a.percentage < 75)

  const handleMarkAttendance = useCallback(
    (data: { subjectId: string; date: Date; status: "present" | "absent"; lecture?: string }) => {
      const subj = attendance.find((a) => a.subjectId === data.subjectId)
      const newRecord: AttendanceRecord = {
        id: `manual-${Date.now()}`,
        subjectId: data.subjectId,
        date: data.date.toISOString().split("T")[0],
        status: data.status,
        lectureId: data.lecture,
      }
      setRecords((prev) => [newRecord, ...prev])
      const update = {
        total: (subj?.total || 0) + 1,
        present: data.status === "present" ? (subj?.present || 0) + 1 : (subj?.present || 0),
        absent: data.status === "absent" ? (subj?.absent || 0) + 1 : (subj?.absent || 0),
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

  const statusColor = overallPercent >= 75 ? "text-green-600" : overallPercent >= 60 ? "text-amber-600" : "text-red-600"
  const statusBg = overallPercent >= 75 ? "bg-green-500/10" : overallPercent >= 60 ? "bg-amber-500/10" : "bg-red-500/10"
  const statusLabel = overallPercent >= 75 ? "On Track" : overallPercent >= 60 ? "Need Attention" : "Critical"

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track, predict, and decide</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full", statusBg, statusColor)}>
              {statusLabel} · {overallPercent.toFixed(1)}%
            </div>
            <MarkAttendanceDialog subjects={subjects} onMark={handleMarkAttendance} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center">
              <ProgressRing percentage={overallPercent} size={100} strokeWidth={7} showTarget />
              <p className="text-xs text-muted-foreground mt-3">Overall Attendance</p>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {totalPresent}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {totalAbsent}
                </span>
                <span className="text-muted-foreground">{totalClasses} total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-5 text-center">
              <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold tabular-nums">{needOverall}</p>
              <p className="text-xs text-muted-foreground">classes to attend</p>
              <p className="text-[10px] text-muted-foreground mt-1">to reach 75% target</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-5 text-center">
              <ClipboardCheck className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold tabular-nums">{canMissOverall}</p>
              <p className="text-xs text-muted-foreground">classes you can</p>
              <p className="text-[10px] text-muted-foreground mt-1">safely skip</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-5 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold tabular-nums">{atRiskSubjects.length}</p>
              <p className="text-xs text-muted-foreground">subjects at risk</p>
              <p className="text-[10px] text-muted-foreground mt-1">below 75% threshold</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Subject Cards with Predictions */}
        <div className="space-y-3 mb-6">
          {sortedSubjects.map((subj, i) => {
            const color = subjects.find((s) => s.id === subj.subjectId)?.color || "#888"
            const pct = subj.percentage
            const target = 75
            const needForTarget = Math.max(0, Math.ceil((target / 100 * subj.total - subj.present) / (1 - target / 100)))
            const canMiss = Math.max(0, Math.floor((subj.present - target / 100 * subj.total) / (target / 100)))
            const predIfPresent = Math.round(((subj.present + 1) / (subj.total + 1)) * 100)
            const predIfAbsent = Math.round((subj.present / (subj.total + 1)) * 100)

            return (
              <motion.div
                key={subj.subjectId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{subj.subjectName}</p>
                    <p className="text-[10px] text-muted-foreground">{subj.present}/{subj.total} classes</p>
                  </div>

                  <ProgressRing percentage={pct} size={44} strokeWidth={4} showTarget />

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] shrink-0">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-semibold text-right">{target}%</span>
                    <span className="text-muted-foreground">Need</span>
                    <span className="font-semibold text-right text-amber-600">{needForTarget}</span>
                    <span className="text-muted-foreground">Can skip</span>
                    <span className="font-semibold text-right text-green-600">{canMiss}</span>
                  </div>

                  <div className="flex flex-col gap-1 text-[9px] shrink-0">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/5">
                      <ArrowUp className="h-2.5 w-2.5 text-green-500" />
                      <span className="text-green-600 font-medium">{predIfPresent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/5">
                      <ArrowDown className="h-2.5 w-2.5 text-red-500" />
                      <span className="text-red-600 font-medium">{predIfAbsent}%</span>
                    </div>
                  </div>

                  <div className={cn(
                    "text-[9px] font-semibold px-2 py-1 rounded-full shrink-0",
                    pct >= 75 ? "bg-green-500/10 text-green-600" :
                    pct >= 60 ? "bg-amber-500/10 text-amber-600" :
                    "bg-red-500/10 text-red-600"
                  )}>
                    {pct >= 75 ? "Safe" : pct >= 60 ? "Risk" : "Critical"}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="quick" className="gap-1.5 text-xs">
              <ClipboardCheck size={14} />
              Quick Mark
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <GraduationCap size={14} />
              Subject Detail
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1.5 text-xs">
              <TrendingUp size={14} />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="records" className="gap-1.5 text-xs">
              <Calendar size={14} />
              Records
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Quick Mark from Timetable</h3>
                <p className="text-xs text-muted-foreground">Click any lecture to mark Present or Absent</p>
              </div>
            </div>
            <TimetableAttendanceView onMark={handleMarkAttendance} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {atRiskSubjects.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm font-semibold">Subjects Below Target</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {atRiskSubjects.map((s) => (
                    <Badge key={s.subjectId} variant="destructive" className="text-xs">
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

          <TabsContent value="records">
            <AttendanceTable
              records={tableRecords}
              subjects={subjects.map((s) => ({ id: s.id, name: s.name, color: s.color }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
