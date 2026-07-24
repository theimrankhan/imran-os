import { Router } from "express"
import type { PrismaClient } from "../generated/client.js"

export default function subjectRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get("/", async (_req, res) => {
    const subjects = await prisma.subject.findMany({ orderBy: { semester: "asc" } })
    res.json(subjects)
  })

  router.get("/:id", async (req, res) => {
    const subject = await prisma.subject.findUnique({ where: { id: req.params.id } })
    if (!subject) return res.status(404).json({ error: "Not found" })
    res.json(subject)
  })

  router.post("/", async (req, res) => {
    const subject = await prisma.subject.create({ data: req.body })
    res.status(201).json(subject)
  })

  router.put("/:id", async (req, res) => {
    const subject = await prisma.subject.update({ where: { id: req.params.id }, data: req.body })
    res.json(subject)
  })

  router.delete("/:id", async (req, res) => {
    await prisma.subject.delete({ where: { id: req.params.id } })
    res.status(204).send()
  })

  return router
}
