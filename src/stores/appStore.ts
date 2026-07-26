import { create } from "zustand"
import { api } from "../lib/api-client"
import type { Settings, Attendance, Note, Subject, Timetable, CalendarEvent, HandwritingFont, NotebookPage } from "../types"

const defaultSettings: Settings = {
  theme: "light",
  handwriting: { font: "default", inkColor: "blue", pageStyle: "notebook", fontSize: 20 },
  ai: { provider: "ollama", model: "llama3.2", endpoint: "http://localhost:11434" },
  notes: { autoSave: true, autoSaveInterval: 30, defaultView: "editor", fontSize: "medium" },
  calendar: { defaultView: "month", weekStartsOn: 1 },
  pdf: { defaultExport: "notes", pageSize: "a4" },
  timetable: { showWeekends: false, lectureDuration: 60 },
}

interface AppState {
  initialized: boolean
  loading: boolean
  error: string | null

  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void

  settings: Settings
  updateSettings: (settings: Partial<Settings>) => void

  subjects: Subject[]
  addSubject: (subject: Subject) => Promise<void>

  attendance: Attendance[]
  markAttendance: (subjectId: string, date: string, status: string) => Promise<void>
  updateAttendance: (subjectId: string, data: { total: number; present: number; absent: number }) => void

  notes: Note[]
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateNote: (id: string, data: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>

  addPageToNote: (noteId: string, page?: Partial<NotebookPage>) => void
  updatePageInNote: (noteId: string, pageId: string, data: Partial<NotebookPage>) => void
  deletePageFromNote: (noteId: string, pageId: string) => void
  duplicatePageInNote: (noteId: string, pageId: string) => void
  reorderPagesInNote: (noteId: string, pageId: string, direction: "up" | "down") => void

  timetable: Timetable[]
  addTimetableEntry: (entry: Omit<Timetable, "id">) => Promise<void>
  removeTimetableEntry: (id: string) => Promise<void>

  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void

  handwritingFonts: HandwritingFont[]
  addFont: (font: HandwritingFont) => void

  searchQuery: string
  setSearchQuery: (query: string) => void

  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void

  retryConnection: () => Promise<void>

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  initialize: () => Promise<void>
}

function createDefaultPage(note: Note): NotebookPage {
  return {
    id: `page-init-${note.id}`,
    pageNumber: 1,
    title: "Page 1",
    content: note.content || "",
    status: note.content ? "in-progress" : "blank",
    wordCount: (note.content || "").split(/\s+/).filter(Boolean).length,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }
}

let settingsCache = defaultSettings
try {
  const saved = localStorage.getItem("imran-os-settings")
  if (saved) settingsCache = { ...defaultSettings, ...JSON.parse(saved) }
} catch {}

export const useStore = create<AppState>((set, get) => ({
  initialized: false,
  loading: true,
  error: null,
  theme: (settingsCache.theme === "system" ? "light" : settingsCache.theme) || "light",
  settings: settingsCache,
  subjects: [],
  attendance: [],
  notes: [],
  timetable: [],
  events: [],
  handwritingFonts: [
    { id: "default", name: "Default Cursive", isCustom: false, color: "blue", style: "cursive" },
    { id: "classic", name: "Classic Print", isCustom: false, color: "black", style: "print" },
  ],
  searchQuery: "",
  isSearchOpen: false,
  sidebarOpen: true,

  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle("dark", theme === "dark")
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings }
    const resolvedTheme = newSettings.theme === "system" ? get().theme : newSettings.theme
    set({ settings: updated, theme: resolvedTheme || get().theme })
    localStorage.setItem("imran-os-settings", JSON.stringify(updated))
  },

  addSubject: async (subject) => {
    try {
      const created = await api.subjects.create(subject)
      set((s) => ({ subjects: [...s.subjects, created] }))
    } catch (e: any) {
      set((s) => ({ subjects: [...s.subjects, subject] }))
    }
  },

  markAttendance: async (subjectId, date, status) => {
    try {
      await api.attendance.mark({ subjectId, date, status })
      const summary = await api.attendance.summary()
      set({ attendance: summary })
    } catch (e: any) {
      set((s) => ({
        attendance: s.attendance.map((a) =>
          a.subjectId === subjectId
            ? {
                ...a,
                total: a.total + 1,
                present: status === "present" ? a.present + 1 : a.present,
                absent: status === "absent" ? a.absent + 1 : a.absent,
                percentage: Math.round(((status === "present" ? a.present + 1 : a.present) / (a.total + 1)) * 10000) / 100,
              }
            : a
        ),
      }))
    }
  },

  updateAttendance: (subjectId, data) => {
    set((s) => ({
      attendance: s.attendance.map((a) =>
        a.subjectId === subjectId
          ? { ...a, ...data, percentage: Math.round((data.present / data.total) * 10000) / 100 }
          : a
      ),
    }))
  },

  addNote: async (note) => {
    const tempId = `temp-${Date.now()}`
    const optimistic = { ...note, id: tempId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Note
    set((s) => ({ notes: [optimistic, ...s.notes] }))
    try {
      const created = await api.notes.create(note)
      set((s) => ({ notes: s.notes.map((n) => (n.id === tempId ? created : n)) }))
    } catch {
      // keep optimistic
    }
  },

  updateNote: async (id, data) => {
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...data } : n)) }))
    try {
      const updated = await api.notes.update(id, data)
      set((s) => ({ notes: s.notes.map((n) => (n.id === id ? updated : n)) }))
    } catch {
      // keep local
    }
  },

  deleteNote: async (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    try {
      await api.notes.delete(id)
    } catch {
      // already removed locally
    }
  },

  addPageToNote: (noteId, page) => {
    set((s) => ({
      notes: s.notes.map((n) => {
        if (n.id !== noteId) return n
        const pages = n.pages || [createDefaultPage(n)]
        const newPage: NotebookPage = {
          id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          pageNumber: pages.length + 1,
          title: `Page ${pages.length + 1}`,
          content: "",
          status: "blank",
          wordCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...page,
        }
        return { ...n, pages: [...pages, newPage] }
      }),
    }))
  },

  updatePageInNote: (noteId, pageId, data) => {
    set((s) => ({
      notes: s.notes.map((n) => {
        if (n.id !== noteId) return n
        const pages = n.pages || [createDefaultPage(n)]
        return {
          ...n,
          pages: pages.map((p) =>
            p.id === pageId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }
      }),
    }))
  },

  deletePageFromNote: (noteId, pageId) => {
    set((s) => ({
      notes: s.notes.map((n) => {
        if (n.id !== noteId) return n
        const pages = (n.pages || [createDefaultPage(n)]).filter((p) => p.id !== pageId)
        if (pages.length === 0) {
          const blank: NotebookPage = {
            id: `page-${Date.now()}-blank`,
            pageNumber: 1,
            title: "Page 1",
            content: "",
            status: "blank",
            wordCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          return { ...n, pages: [blank] }
        }
        return {
          ...n,
          pages: pages.map((p, i) => ({ ...p, pageNumber: i + 1 })),
        }
      }),
    }))
  },

  duplicatePageInNote: (noteId, pageId) => {
    set((s) => ({
      notes: s.notes.map((n) => {
        if (n.id !== noteId) return n
        const pages = n.pages || [createDefaultPage(n)]
        const idx = pages.findIndex((p) => p.id === pageId)
        if (idx === -1) return n
        const source = pages[idx]
        const dup: NotebookPage = {
          ...source,
          id: `page-${Date.now()}-dup`,
          pageNumber: idx + 2,
          title: `${source.title} (copy)`,
          status: source.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const updated = [...pages]
        updated.splice(idx + 1, 0, dup)
        return {
          ...n,
          pages: updated.map((p, i) => ({ ...p, pageNumber: i + 1 })),
        }
      }),
    }))
  },

  reorderPagesInNote: (noteId, pageId, direction) => {
    set((s) => ({
      notes: s.notes.map((n) => {
        if (n.id !== noteId) return n
        const pages = n.pages || [createDefaultPage(n)]
        const idx = pages.findIndex((p) => p.id === pageId)
        if (idx === -1) return n
        const swap = direction === "up" ? idx - 1 : idx + 1
        if (swap < 0 || swap >= pages.length) return n
        const updated = [...pages]
        ;[updated[idx], updated[swap]] = [updated[swap], updated[idx]]
        return {
          ...n,
          pages: updated.map((p, i) => ({ ...p, pageNumber: i + 1 })),
        }
      }),
    }))
  },

  addTimetableEntry: async (entry) => {
    try {
      const created = await api.timetable.create(entry)
      set((s) => ({ timetable: [...s.timetable, created] }))
    } catch (e: any) {
      const temp = { ...entry, id: `temp-${Date.now()}` } as Timetable
      set((s) => ({ timetable: [...s.timetable, temp] }))
    }
  },

  removeTimetableEntry: async (id) => {
    set((s) => ({ timetable: s.timetable.filter((e) => e.id !== id) }))
    try {
      await api.timetable.delete(id)
    } catch {
      // already removed
    }
  },

  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  addFont: (font) => set((s) => ({ handwritingFonts: [...s.handwritingFonts, font] })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  initialize: async () => {
    set({ loading: true, error: null })
    try {
      const [subjects, timetable, attendance, notes] = await Promise.all([
        api.subjects.list(),
        api.timetable.list(),
        api.attendance.summary(),
        api.notes.list(),
      ])
      set({ subjects, timetable, attendance, notes, initialized: true, loading: false })
    } catch (e: any) {
      console.warn("Backend unavailable, using fallback data:", e.message)
      set({
        initialized: true,
        loading: false,
        error: "Backend server unavailable. Some features may not work.",
      })
    }
  },

  retryConnection: async () => {
    set({ loading: true, error: null })
    try {
      const [subjects, timetable, attendance, notes] = await Promise.all([
        api.subjects.list(),
        api.timetable.list(),
        api.attendance.summary(),
        api.notes.list(),
      ])
      set({ subjects, timetable, attendance, notes, initialized: true, loading: false, error: null })
    } catch (e: any) {
      set({ initialized: true, loading: false, error: "Backend server unavailable. Some features may not work." })
    }
  },
}))

// Auto-initialize
useStore.getState().initialize()
