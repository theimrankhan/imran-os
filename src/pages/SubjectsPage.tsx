import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Plus, GraduationCap, User, Hash } from "lucide-react"
import { PageContainer } from "../components/layout/PageContainer"
import { Button } from "../components/ui/button"
import AddSubjectDialog from "../components/subjects/AddSubjectDialog"
import { useStore } from "../stores/appStore"

export default function SubjectsPage() {
  const { subjects } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <PageContainer
      title="Subjects"
      description="Manage your academic subjects"
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Subject
        </Button>
      }
    >
      <AddSubjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No subjects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first subject to get started</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subject
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, i) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: subject.color }}>
                  {subject.code?.slice(0, 2) || subject.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{subject.name}</p>
                  {subject.code && <p className="text-xs text-muted-foreground">{subject.code}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Sem {subject.semester}
                </span>
                {subject.credits && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {subject.credits} credits
                  </span>
                )}
                {subject.professor && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {subject.professor}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
