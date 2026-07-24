import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Target, AlertTriangle, CheckCircle } from "lucide-react"
import AttendanceRing from "../dashboard/AttendanceRing"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible"
import { Separator } from "../ui/separator"
import { cn } from "../../lib/utils"

interface SubjectAttendanceCardProps {
  subjectId: string
  subjectName: string
  total: number
  present: number
  absent: number
  percentage: number
  color: string
}

function needsToAttend(present: number, total: number, target: number): { need: number; canMiss: number } {
  const targetDecimal = target / 100
  const need = Math.ceil((targetDecimal * total - present) / (1 - targetDecimal))
  const canMiss = Math.floor((present - targetDecimal * total) / targetDecimal)
  return {
    need: Math.max(0, need),
    canMiss: Math.max(0, canMiss),
  }
}

export default function SubjectAttendanceCard({
  subjectId: _subjectId,
  subjectName,
  total,
  present,
  absent,
  percentage,
  color,
}: SubjectAttendanceCardProps) {
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState(75)
  const [bunkAttend, setBunkAttend] = useState(0)
  const [bunkMiss, setBunkMiss] = useState(0)
  const { need, canMiss } = needsToAttend(present, total, target)

  const bunkProjection = total + bunkAttend + bunkMiss > 0
    ? ((present + bunkAttend) / (total + bunkAttend + bunkMiss)) * 100
    : 0

  const status = percentage >= 75 ? "success" : percentage >= 60 ? "warning" : "destructive"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={cn(
          "group overflow-hidden border transition-all duration-300",
          "hover:shadow-lg hover:shadow-black/[0.04]",
          "dark:hover:shadow-black/[0.15]"
        )}
      >
        <CardContent className="p-5">
          <Collapsible open={open} onOpenChange={setOpen}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <AttendanceRing percentage={percentage} size={72} strokeWidth={5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <h3 className="font-semibold text-[var(--color-foreground)] truncate text-sm">
                    {subjectName}
                  </h3>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-[var(--color-success)]" />
                    <span className="text-xs font-medium text-[var(--color-success)]">{present} Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-[var(--color-destructive)]" />
                    <span className="text-xs font-medium text-[var(--color-destructive)]">{absent} Absent</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={status} className="text-xs">
                    {percentage.toFixed(1)}%
                  </Badge>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {total} total classes
                  </span>
                </div>
              </div>

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="flex-shrink-0">
                  {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={14} className="text-[var(--color-primary)]" />
                    <span className="text-xs font-semibold text-[var(--color-foreground)]">Target Attendance</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {[65, 75, 85].map((t) => (
                      <Button
                        key={t}
                        variant={target === t ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7 px-3"
                        onClick={() => setTarget(t)}
                      >
                        {t}%
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[var(--color-secondary)]/50 p-3">
                      <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Need to attend</p>
                      <p className="text-lg font-bold text-[var(--color-foreground)]">
                        {need}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">more classes</p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-secondary)]/50 p-3">
                      <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Can safely miss</p>
                      <p className="text-lg font-bold text-[var(--color-foreground)]">
                        {canMiss}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">classes</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-[var(--color-warning)]" />
                    <span className="text-xs font-semibold text-[var(--color-foreground)]">Safe Bunk Calculator</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
                    Simulate attending or missing future classes
                  </p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--color-muted-foreground)]">Attend next</span>
                        <span className="font-medium text-[var(--color-success)]">{bunkAttend}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={bunkAttend}
                        onChange={(e) => setBunkAttend(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-success) ${(bunkAttend / 20) * 100}%, var(--color-secondary) ${(bunkAttend / 20) * 100}%)`,
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--color-muted-foreground)]">Miss next</span>
                        <span className="font-medium text-[var(--color-destructive)]">{bunkMiss}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={bunkMiss}
                        onChange={(e) => setBunkMiss(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-destructive) ${(bunkMiss / 20) * 100}%, var(--color-secondary) ${(bunkMiss / 20) * 100}%)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-muted-foreground)]">Projected attendance</span>
                      <Badge
                        variant={bunkProjection >= target ? "success" : "destructive"}
                        className="text-xs"
                      >
                        {bunkProjection.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                      If you attend {bunkAttend} and miss {bunkMiss} of the next {bunkAttend + bunkMiss} classes
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </motion.div>
  )
}