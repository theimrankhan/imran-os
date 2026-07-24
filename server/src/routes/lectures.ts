import { Router } from "express"
import type { PrismaClient } from "../generated/client.js"

export default function lectureRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get("/", async (req, res) => {
    const { date, subjectId } = req.query
    const where: Record<string, unknown> = {}
    if (date) where.date = date
    if (subjectId) where.subjectId = subjectId
    const lectures = await prisma.lecture.findMany({
      where,
      include: { subject: true },
      orderBy: { date: "asc" },
    })
    res.json(lectures)
  })

  router.get("/:id", async (req, res) => {
    const lecture = await prisma.lecture.findUnique({
      where: { id: req.params.id },
      include: { subject: true, notes: true, attendance: true },
    })
    if (!lecture) return res.status(404).json({ error: "Not found" })
    res.json(lecture)
  })

  router.post("/", async (req, res) => {
    const lecture = await prisma.lecture.create({ data: req.body })
    res.status(201).json(lecture)
  })

  router.put("/:id", async (req, res) => {
    const lecture = await prisma.lecture.update({ where: { id: req.params.id }, data: req.body })
    res.json(lecture)
  })

  router.delete("/:id", async (req, res) => {
    await prisma.lecture.delete({ where: { id: req.params.id } })
    res.status(204).send()
  })

  return router
}
