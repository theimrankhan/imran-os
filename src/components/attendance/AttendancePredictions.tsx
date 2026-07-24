import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Target } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"

interface SubjectData {
  subjectId: string
  subjectName: string
  total: number
  present: number
  absent: number
  percentage: number
  color: string
}

interface AttendancePredictionsProps {
  subjects: SubjectData[]
}

function simulatePrediction(
  subject: SubjectData,
  attendNext: number,
  missNext: number,
): { scenario: string; percentage: number; color: string }[] {
  const scenarios = [
    { scenario: "Current", percentage: subject.percentage, color: subject.color },
  ]

  const afterAttend = subject.total + attendNext > 0
    ? ((subject.present + attendNext) / (subject.total + attendNext)) * 100
    : subject.percentage

  scenarios.push({
    scenario: `+${attendNext} attend`,
    percentage: afterAttend,
    color: "var(--color-success)",
  })

  const afterMiss = subject.total + missNext > 0
    ? (subject.present / (subject.total + missNext)) * 100
    : subject.percentage

  scenarios.push({
    scenario: `-${missNext} miss`,
    percentage: afterMiss,
    color: "var(--color-destructive)",
  })

  const net = attendNext + missNext
  const afterNet = subject.total + net > 0
    ? ((subject.present + attendNext) / (subject.total + net)) * 100
    : subject.percentage

  scenarios.push({
    scenario: `Net effect`,
    percentage: afterNet,
    color: "var(--color-warning)",
  })

  return scenarios
}

export default function AttendancePredictions({ subjects }: AttendancePredictionsProps) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.subjectId || "")
  const [attendNext, setAttendNext] = useState(5)
  const [missNext, setMissNext] = useState(2)

  const subject = subjects.find((s) => s.subjectId === selectedSubject)
  if (!subject || subjects.length === 0) return null

  const predictions = simulatePrediction(subject, attendNext, missNext)
  const target = 75

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--color-primary)]" />
            <CardTitle className="text-sm font-semibold">Attendance Predictions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {subjects.map((s) => (
              <Button
                key={s.subjectId}
                variant={selectedSubject === s.subjectId ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedSubject(s.subjectId)}
              >
                {s.subjectName}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-muted-foreground)]">Attend next</span>
                <span className="font-semibold text-[var(--color-success)]">{attendNext}</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={attendNext}
                onChange={(e) => setAttendNext(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-success) ${(attendNext / 20) * 100}%, var(--color-secondary) ${(attendNext / 20) * 100}%)`,
                }}
              />
              <div className="flex justify-between text-xs mt-0.5 text-[var(--color-muted-foreground)]">
                <span>0</span>
                <span>20</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-muted-foreground)]">Miss next</span>
                <span className="font-semibold text-[var(--color-destructive)]">{missNext}</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={missNext}
                onChange={(e) => setMissNext(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-destructive) ${(missNext / 20) * 100}%, var(--color-secondary) ${(missNext / 20) * 100}%)`,
                }}
              />
              <div className="flex justify-between text-xs mt-0.5 text-[var(--color-muted-foreground)]">
                <span>0</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-[var(--color-muted-foreground)] mb-2">
              Simulating <strong className="text-[var(--color-foreground)]">{subject.subjectName}</strong>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-muted-foreground)]">Current:</span>
              <Badge
                variant={subject.percentage >= target ? "success" : "destructive"}
                className="text-xs"
              >
                {subject.percentage.toFixed(1)}%
              </Badge>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                ({subject.present}/{subject.total})
              </span>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictions} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="scenario"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={{ stroke: "var(--color-secondary)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={{ stroke: "var(--color-secondary)" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Attendance"]}
                />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {predictions.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-muted-foreground)]">Target</span>
              <Target size={14} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-secondary)]/50">
              <div className="flex items-center gap-2">
                {subject.percentage >= target ? (
                  <Badge variant="success" className="text-xs">On track</Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">Below target</Badge>
                )}
              </div>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {subject.percentage >= target
                  ? `You can miss ${Math.floor((subject.present - (target / 100) * subject.total) / (target / 100))} classes`
                  : `Need ${Math.ceil(((target / 100) * subject.total - subject.present) / (1 - target / 100))} more classes`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}