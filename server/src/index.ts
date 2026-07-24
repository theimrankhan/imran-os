import "dotenv/config"
import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import { PrismaClient } from "./generated/client.js"
import subjectRoutes from "./routes/subjects.js"
import lectureRoutes from "./routes/lectures.js"
import noteRoutes from "./routes/notes.js"
import attendanceRoutes from "./routes/attendance.js"
import timetableRoutes from "./routes/timetable.js"
import eventRoutes from "./routes/events.js"
import aiRoutes from "./routes/ai.js"
import { errorHandler } from "./middleware/errorHandler.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use("/api/v1/subjects", subjectRoutes(prisma))
app.use("/api/v1/lectures", lectureRoutes(prisma))
app.use("/api/v1/notes", noteRoutes(prisma))
app.use("/api/v1/attendance", attendanceRoutes(prisma))
app.use("/api/v1/timetable", timetableRoutes(prisma))
app.use("/api/v1/events", eventRoutes(prisma))
app.use("/api/v1/ai", aiRoutes())

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

const distPath = path.resolve(__dirname, "../../dist")
app.use(express.static(distPath))
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"))
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Imran OS Server running on http://localhost:${PORT}`)
})

export { prisma }
