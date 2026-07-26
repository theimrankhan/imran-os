import { Router } from "express"
import type { PrismaClient } from "../generated/client.js"

export default function timetableExceptionRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get("/", async (req, res) => {
    const { entryId, date } = req.query
    const where: Record<string, unknown> = {}
    if (entryId) where.entryId = entryId
    if (date) where.date = date
    const exceptions = await prisma.timetableException.findMany({ where, orderBy: { createdAt: "desc" } })
    res.json(exceptions)
  })

  router.post("/", async (req, res) => {
    const exception = await prisma.timetableException.create({ data: req.body })
    res.status(201).json(exception)
  })

  router.delete("/:id", async (req, res) => {
    await prisma.timetableException.delete({ where: { id: req.params.id } })
    res.status(204).send()
  })

  return router
}
