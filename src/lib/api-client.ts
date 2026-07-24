const BASE_URL = "http://localhost:3001/api/v1"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  subjects: {
    list: () => request<any[]>("/subjects"),
    get: (id: string) => request<any>(`/subjects/${id}`),
    create: (data: any) => request<any>("/subjects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/subjects/${id}`, { method: "DELETE" }),
  },
  lectures: {
    list: (params?: { date?: string; subjectId?: string }) => {
      const q = new URLSearchParams()
      if (params?.date) q.set("date", params.date)
      if (params?.subjectId) q.set("subjectId", params.subjectId)
      const qs = q.toString()
      return request<any[]>(`/lectures${qs ? `?${qs}` : ""}`)
    },
    get: (id: string) => request<any>(`/lectures/${id}`),
  },
  notes: {
    list: (params?: { subjectId?: string; type?: string }) => {
      const q = new URLSearchParams()
      if (params?.subjectId) q.set("subjectId", params.subjectId)
      if (params?.type) q.set("type", params.type)
      const qs = q.toString()
      return request<any[]>(`/notes${qs ? `?${qs}` : ""}`)
    },
    get: (id: string) => request<any>(`/notes/${id}`),
    create: (data: any) => request<any>("/notes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/notes/${id}`, { method: "DELETE" }),
  },
  attendance: {
    summary: () => request<any[]>("/attendance"),
    records: (subjectId?: string) => {
      const qs = subjectId ? `?subjectId=${subjectId}` : ""
      return request<any[]>(`/attendance/records${qs}`)
    },
    mark: (data: { subjectId: string; date: string; status: string; lectureId?: string }) =>
      request<any>("/attendance/mark", { method: "POST", body: JSON.stringify(data) }),
    stats: () => request<any>("/attendance/stats"),
  },
  timetable: {
    list: (semester?: number) => {
      const qs = semester ? `?semester=${semester}` : ""
      return request<any[]>(`/timetable${qs}`)
    },
    create: (data: any) => request<any>("/timetable", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/timetable/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/timetable/${id}`, { method: "DELETE" }),
  },
  events: {
    list: () => request<any[]>("/events"),
    create: (data: any) => request<any>("/events", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/events/${id}`, { method: "DELETE" }),
  },
  ai: {
    summary: (content: string) => request<{ summary: string }>("/ai/summary", { method: "POST", body: JSON.stringify({ content }) }),
    questions: (content: string) => request<{ questions: string[] }>("/ai/questions", { method: "POST", body: JSON.stringify({ content }) }),
    mcqs: (content: string, count = 5) => request<{ mcqs: any[] }>("/ai/mcqs", { method: "POST", body: JSON.stringify({ content, count }) }),
    improve: (content: string) => request<{ suggestions: string[] }>("/ai/improve", { method: "POST", body: JSON.stringify({ content }) }),
    topics: (content: string) => request<{ topics: string[] }>("/ai/topics", { method: "POST", body: JSON.stringify({ content }) }),
  },
}
