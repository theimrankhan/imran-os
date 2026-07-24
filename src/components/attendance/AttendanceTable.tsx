import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Calendar, ArrowUpDown, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { cn } from "../../lib/utils"

interface AttendanceRecordData {
  id: string
  subjectId: string
  subjectName: string
  date: string
  status: "present" | "absent"
  lecture?: string
  color: string
}

interface AttendanceTableProps {
  records: AttendanceRecordData[]
  subjects: { id: string; name: string; color: string }[]
}

type SortField = "date" | "subjectName" | "status"
type SortDir = "asc" | "desc"

export default function AttendanceTable({ records, subjects }: AttendanceTableProps) {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [search, setSearch] = useState("")

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const filtered = useMemo(() => {
    let result = [...records]

    if (filterSubject !== "all") {
      result = result.filter((r) => r.subjectId === filterSubject)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.subjectName.toLowerCase().includes(q) ||
          r.lecture?.toLowerCase().includes(q) ||
          r.date.includes(q),
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === "date") cmp = a.date.localeCompare(b.date)
      else if (sortField === "subjectName") cmp = a.subjectName.localeCompare(b.subjectName)
      else if (sortField === "status") cmp = a.status.localeCompare(b.status)
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [records, sortField, sortDir, filterSubject, search])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />
    return (
      <ArrowUpDown
        size={12}
        className={cn(
          "transition-transform",
          sortDir === "asc" ? "rotate-180" : "",
        )}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[var(--color-primary)]" />
              <CardTitle className="text-sm font-semibold">Attendance Records</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-36 text-xs pl-7"
                />
                <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              </div>
              <div className="flex gap-1">
                <Button
                  variant={filterSubject === "all" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setFilterSubject("all")}
                >
                  All
                </Button>
                {subjects.map((s) => (
                  <Button
                    key={s.id}
                    variant={filterSubject === s.id ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setFilterSubject(s.id)}
                    style={{
                      backgroundColor: filterSubject === s.id ? s.color : undefined,
                      borderColor: filterSubject !== s.id ? s.color : undefined,
                      color: filterSubject === s.id ? "#fff" : s.color,
                    }}
                  >
                    {s.name.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th
                    className="text-left text-xs font-medium text-[var(--color-muted-foreground)] pb-3 cursor-pointer select-none"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date <SortIcon field="date" />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-medium text-[var(--color-muted-foreground)] pb-3 cursor-pointer select-none"
                    onClick={() => toggleSort("subjectName")}
                  >
                    <div className="flex items-center gap-1">
                      Subject <SortIcon field="subjectName" />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-medium text-[var(--color-muted-foreground)] pb-3 cursor-pointer select-none"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--color-muted-foreground)] pb-3">
                    Lecture
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="pt-8 pb-8 text-center">
                      <p className="text-sm text-[var(--color-muted-foreground)]">No records found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={cn(
                        "group border-b border-[var(--color-border)]/50 transition-colors",
                        "hover:bg-[var(--color-secondary)]/30",
                      )}
                    >
                      <td className="py-3 text-sm text-[var(--color-foreground)]">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: record.color }}
                          />
                          <span className="text-sm text-[var(--color-foreground)]">
                            {record.subjectName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={record.status === "present" ? "success" : "destructive"}
                          className="text-xs capitalize"
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-[var(--color-muted-foreground)]">
                        {record.lecture || "—"}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Showing {filtered.length} of {records.length} records
            </p>
            <div className="flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                Present
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--color-destructive)]" />
                Absent
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}