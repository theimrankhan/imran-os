export interface Subject {
  id: string
  name: string
  code: string
  semester: number
  color: string
  professor?: string
  credits?: number
}

export interface Lecture {
  id: string
  subjectId: string
  subjectName: string
  date: string
  startTime: string
  endTime: string
  dayOfWeek: number
  room?: string
  type: "theory" | "lab" | "tutorial"
  color: string
  attendance?: Attendance
  notes?: Note[]
}

export interface Timetable {
  id: string
  subjectId: string
  subjectName: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string
  type: "theory" | "lab" | "tutorial"
  color: string
  semester: number
}

export interface Attendance {
  id: string
  subjectId: string
  subjectName: string
  total: number
  present: number
  absent: number
  percentage: number
}

export interface AttendanceRecord {
  id: string
  subjectId: string
  date: string
  status: "present" | "absent"
  lectureId?: string
}

export interface NotebookPage {
  id: string
  pageNumber: number
  title: string
  content: string
  status: "blank" | "in-progress" | "completed" | "needs-revision" | "ai-generated"
  aiSuggestions?: string
  wordCount: number
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  subjectId: string
  subjectName: string
  lectureNumber: number
  title: string
  content: string
  pages?: NotebookPage[]
  summary?: string
  revisionNotes?: string
  importantQuestions?: string
  aiSuggestions?: string
  type: "normal" | "handwritten" | "revision" | "quick"
  tags: string[]
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface AIAssistResult {
  summary?: string
  importantTopics?: string[]
  mcqs?: { question: string; options: string[]; answer: number }[]
  revisionSuggestions?: string[]
  importantQuestions?: string[]
  improvements?: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  type: "lecture" | "exam" | "assignment" | "holiday" | "personal"
  subjectId?: string
  subjectName?: string
  color: string
  description?: string
}

export interface HandwritingFont {
  id: string
  name: string
  isCustom: boolean
  color: "blue" | "black"
  style: "cursive" | "print"
}

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: "note" | "subject" | "lecture" | "attendance" | "topic"
  url: string
  icon?: string
}

export interface Settings {
  theme: "light" | "dark" | "system"
  handwriting: {
    font: string
    inkColor: "blue" | "black"
    pageStyle: "notebook" | "plain" | "grid"
    fontSize: number
  }
  ai: {
    provider: "ollama" | "gemini"
    model: string
    apiKey?: string
    endpoint?: string
  }
  notes: {
    autoSave: boolean
    autoSaveInterval: number
    defaultView: "editor" | "preview"
    fontSize: "small" | "medium" | "large"
  }
  calendar: {
    defaultView: "month" | "week" | "day"
    weekStartsOn: number
  }
  pdf: {
    defaultExport: "notes" | "handwritten"
    pageSize: "a4" | "letter"
  }
  timetable: {
    showWeekends: boolean
    lectureDuration: number
  }
}
