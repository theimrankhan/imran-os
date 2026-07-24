import { Router } from "express"
import type { PrismaClient } from "../generated/client.js"

export default function attendanceRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get("/", async (_req, res) => {
    const subjects = await prisma.subject.findMany({
      include: { attendance: true },
    })
    const summary = (subjects as any[]).map((s: any) => {
      const total = s.attendance.length
      const present = s.attendance.filter((a: any) => a.status === "present").length
      const absent = total - present
      return {
        subjectId: s.id,
        subjectName: s.name,
        total,
        present,
        absent,
        percentage: total > 0 ? Math.round((present / total) * 10000) / 100 : 0,
      }
    })
    res.json(summary)
  })

  router.get("/records", async (req, res) => {
    const { subjectId } = req.query
    const where: Record<string, unknown> = {}
    if (subjectId) where.subjectId = subjectId
    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { subject: true, lecture: true },
      orderBy: { date: "desc" },
    })
    res.json(records)
  })

  router.post("/mark", async (req, res) => {
    const { subjectId, date, status, lectureId } = req.body
    const record = await prisma.attendanceRecord.create({
      data: { subjectId, date, status, lectureId },
    })
    res.status(201).json(record)
  })

  router.get("/stats", async (_req, res) => {
    const subjects = await prisma.subject.findMany({
      include: { attendance: true },
    })
    let totalPresent = 0
    let totalAbsent = 0
    ;(subjects as any[]).forEach((s: any) => {
      totalPresent += s.attendance.filter((a: any) => a.status === "present").length
      totalAbsent += s.attendance.filter((a: any) => a.status === "absent").length
    })
    const total = totalPresent + totalAbsent
    res.json({
      total,
      present: totalPresent,
      absent: totalAbsent,
      percentage: total > 0 ? Math.round((totalPresent / total) * 10000) / 100 : 0,
    })
  })

  return router
}
