import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useStore } from "../../stores/appStore"
import type { Subject } from "../../types"

const PRESET_COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#DC2626", "#F59E0B", "#EC4899", "#06B6D4", "#F97316"]

interface AddSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddSubjectDialog({ open, onOpenChange }: AddSubjectDialogProps) {
  const { subjects, addSubject } = useStore()

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [semester, setSemester] = useState("3")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [professor, setProfessor] = useState("")
  const [credits, setCredits] = useState("3")
  const [error, setError] = useState("")

  function handleSubmit() {
    setError("")
    if (!name.trim()) { setError("Subject name is required"); return }
    if (!code.trim()) { setError("Subject code is required"); return }

    const id = code.trim().toLowerCase().replace(/\s+/g, "-")

    const newSubject: Subject = {
      id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      semester: parseInt(semester, 10) || 3,
      color,
      professor: professor.trim() || undefined,
      credits: parseInt(credits, 10) || undefined,
    }

    addSubject(newSubject)
    handleReset()
    onOpenChange(false)
  }

  function handleReset() {
    setName("")
    setCode("")
    setSemester("3")
    setColor(PRESET_COLORS[0])
    setProfessor("")
    setCredits("3")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
          <DialogDescription>Add a new subject to your academic profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-name">Subject Name</Label>
              <Input id="sub-name" placeholder="e.g. Data Structures" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-code">Code</Label>
              <Input id="sub-code" placeholder="e.g. CS101" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-semester">Semester</Label>
              <Input id="sub-semester" type="number" min={1} max={8} value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-credits">Credits</Label>
              <Input id="sub-credits" type="number" min={1} max={6} value={credits} onChange={(e) => setCredits(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-professor">Professor (optional)</Label>
            <Input id="sub-professor" placeholder="e.g. Dr. Sharma" value={professor} onChange={(e) => setProfessor(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Subjects: {subjects.length} total</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { handleReset(); onOpenChange(false) }}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Subject</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
