import { Router } from "express"
import type { PrismaClient } from "../generated/client.js"

export default function timetableRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get("/", async (req, res) => {
    const { semester } = req.query
    const where: Record<string, unknown> = {}
    if (semester) where.semester = parseInt(semester as string)
    const entries = await prisma.timetableEntry.findMany({
      where,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
    res.json(entries)
  })

  router.post("/", async (req, res) => {
    const entry = await prisma.timetableEntry.create({ data: req.body })
    res.status(201).json(entry)
  })

  router.put("/:id", async (req, res) => {
    const entry = await prisma.timetableEntry.update({ where: { id: req.params.id }, data: req.body })
    res.json(entry)
  })

  router.delete("/:id", async (req, res) => {
    await prisma.timetableEntry.delete({ where: { id: req.params.id } })
    res.status(204).send()
  })

  return router
}
