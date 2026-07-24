import { Router } from "express"
import type { PrismaClient } from "../generated/client.js"

export default function noteRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get("/", async (req, res) => {
    const { subjectId, type } = req.query
    const where: Record<string, unknown> = {}
    if (subjectId) where.subjectId = subjectId
    if (type) where.type = type
    const notes = await prisma.note.findMany({
      where,
      include: { subject: true, lecture: true },
      orderBy: { createdAt: "desc" },
    })
    res.json(notes.map((n) => ({ ...n, subjectName: n.subject?.name || "", tags: n.tags ? n.tags.split(",").filter(Boolean) : [] })))
  })

  router.get("/:id", async (req, res) => {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { subject: true, lecture: true },
    })
    if (!note) return res.status(404).json({ error: "Not found" })
    res.json({ ...note, subjectName: note.subject?.name || "", tags: note.tags ? note.tags.split(",").filter(Boolean) : [] })
  })

  router.post("/", async (req, res) => {
    const { subjectName, tags, ...data } = req.body
    const note = await prisma.note.create({ data: { ...data, tags: Array.isArray(tags) ? tags.join(",") : tags }, include: { subject: true } })
    res.status(201).json({ ...note, subjectName: note.subject?.name || subjectName })
  })

  router.put("/:id", async (req, res) => {
    const { subjectName, tags, ...data } = req.body
    const note = await prisma.note.update({ where: { id: req.params.id }, data: { ...data, tags: Array.isArray(tags) ? tags.join(",") : tags }, include: { subject: true } })
    res.json({ ...note, subjectName: note.subject?.name || subjectName })
  })

  router.delete("/:id", async (req, res) => {
    await prisma.note.delete({ where: { id: req.params.id } })
    res.status(204).send()
  })

  return router
}
