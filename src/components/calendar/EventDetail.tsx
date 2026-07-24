import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Clock, MapPin, FileText, UserCheck, BookOpen, GraduationCap, Download } from "lucide-react"

interface EventDetailProps {
  event: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetail({ event, open, onOpenChange }: EventDetailProps) {
  if (!event) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
            <SheetTitle className="text-lg">{event.title}</SheetTitle>
          </div>
          <SheetDescription>Lecture Details</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          {event.room && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{event.room}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {event.typeLabel || event.type}
            </Badge>
            <Badge variant="secondary">Semester 3</Badge>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Attendance
            </h4>
            <div className="flex gap-2">
              <Button size="sm" variant="success" className="flex-1">Mark Present</Button>
              <Button size="sm" variant="destructive" className="flex-1">Mark Absent</Button>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <BookOpen className="w-3 h-3 mr-1" /> View Notes
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="w-3 h-3 mr-1" /> Download PDF
              </Button>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Resources
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-secondary/50 text-sm hover:bg-secondary cursor-pointer transition-colors">
                Lecture Slides - Unit 3
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-sm hover:bg-secondary cursor-pointer transition-colors">
                Reference Material - Chapter 5
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
