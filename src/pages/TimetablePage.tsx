import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import TimetableHeader from "../components/timetable/TimetableHeader"
import TimetableGrid from "../components/timetable/TimetableGrid"
import AddLectureDialog from "../components/timetable/AddLectureDialog"
import LabTimetable from "../components/timetable/LabTimetable"
import ExamSchedule from "../components/timetable/ExamSchedule"
import { useStore } from "../stores/appStore"
import type { Timetable } from "../types"

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function TimetablePage() {
  const { timetable, removeTimetableEntry } = useStore()

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()))
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Timetable | null>(null)

  const handlePrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }, [])

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }, [])

  const handleAddLecture = useCallback(() => {
    setEditingEntry(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((id: string) => {
    const entry = timetable.find((e) => e.id === id)
    if (entry) {
      setEditingEntry(entry)
      setDialogOpen(true)
    }
  }, [timetable])

  const handleDelete = useCallback((id: string) => {
    removeTimetableEntry(id)
  }, [removeTimetableEntry])

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false)
    setEditingEntry(null)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <TimetableHeader
          currentWeekStart={currentWeekStart}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onAddLecture={handleAddLecture}
          semesterFilter={semesterFilter}
          onSemesterFilterChange={setSemesterFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TimetableGrid
            entries={timetable}
            onEdit={handleEdit}
            onDelete={handleDelete}
            semesterFilter={semesterFilter}
            typeFilter={typeFilter}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <LabTimetable />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <ExamSchedule />
          </motion.div>
        </div>
      </div>

      <AddLectureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editEntry={editingEntry}
        onClose={handleDialogClose}
      />
    </div>
  )
}