import { Router } from "express"
import type { PrismaClient } from "../generated/client.js"

export default function eventRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get("/", async (req, res) => {
    const { startDate, endDate } = req.query
    const where: Record<string, unknown> = {}
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate }
    }
    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { date: "asc" },
    })
    res.json(events)
  })

  router.post("/", async (req, res) => {
    const event = await prisma.calendarEvent.create({ data: req.body })
    res.status(201).json(event)
  })

  router.delete("/:id", async (req, res) => {
    await prisma.calendarEvent.delete({ where: { id: req.params.id } })
    res.status(204).send()
  })

  return router
}
