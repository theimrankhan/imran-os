import { PrismaClient } from "../src/generated/client.js"

const prisma = new PrismaClient()

const SUBJECTS = [
  { id: "java", name: "Java Programming", code: "CS201", semester: 3, color: "#2563EB", professor: "Dr. Sharma", credits: 4 },
  { id: "cn", name: "Computer Networks", code: "CS301", semester: 3, color: "#7C3AED", professor: "Prof. Gupta", credits: 3 },
  { id: "os", name: "Operating Systems", code: "CS302", semester: 3, color: "#16A34A", professor: "Dr. Patel", credits: 4 },
  { id: "dbms", name: "Database Management Systems", code: "CS303", semester: 3, color: "#DC2626", professor: "Prof. Singh", credits: 3 },
  { id: "maths", name: "Mathematics III", code: "MA201", semester: 3, color: "#F59E0B", professor: "Dr. Verma", credits: 3 },
]

const TIMETABLE = [
  { id: "1", subjectId: "os", subjectName: "Operating Systems", dayOfWeek: 1, startTime: "09:00", endTime: "10:00", room: "LT-1", type: "theory", color: "#16A34A", semester: 3 },
  { id: "2", subjectId: "cn", subjectName: "Computer Networks", dayOfWeek: 1, startTime: "10:00", endTime: "11:00", room: "LT-2", type: "theory", color: "#7C3AED", semester: 3 },
  { id: "3", subjectId: "java", subjectName: "Java Programming", dayOfWeek: 1, startTime: "11:00", endTime: "12:00", room: "LT-3", type: "theory", color: "#2563EB", semester: 3 },
  { id: "4", subjectId: "dbms", subjectName: "Database Management Systems", dayOfWeek: 2, startTime: "09:00", endTime: "10:00", room: "LT-1", type: "theory", color: "#DC2626", semester: 3 },
  { id: "5", subjectId: "maths", subjectName: "Mathematics III", dayOfWeek: 2, startTime: "10:00", endTime: "11:00", room: "LT-4", type: "theory", color: "#F59E0B", semester: 3 },
  { id: "6", subjectId: "java", subjectName: "Java Programming", dayOfWeek: 3, startTime: "09:00", endTime: "10:00", room: "LT-3", type: "theory", color: "#2563EB", semester: 3 },
  { id: "7", subjectId: "os", subjectName: "Operating Systems", dayOfWeek: 3, startTime: "10:00", endTime: "11:00", room: "LT-1", type: "theory", color: "#16A34A", semester: 3 },
  { id: "8", subjectId: "cn", subjectName: "Computer Networks Lab", dayOfWeek: 3, startTime: "14:00", endTime: "16:00", room: "Lab-2", type: "lab", color: "#7C3AED", semester: 3 },
  { id: "9", subjectId: "cn", subjectName: "Computer Networks", dayOfWeek: 4, startTime: "09:00", endTime: "10:00", room: "LT-2", type: "theory", color: "#7C3AED", semester: 3 },
  { id: "10", subjectId: "dbms", subjectName: "Database Management Systems", dayOfWeek: 4, startTime: "10:00", endTime: "11:00", room: "LT-1", type: "theory", color: "#DC2626", semester: 3 },
  { id: "11", subjectId: "os", subjectName: "Operating Systems Lab", dayOfWeek: 4, startTime: "14:00", endTime: "16:00", room: "Lab-1", type: "lab", color: "#16A34A", semester: 3 },
  { id: "12", subjectId: "maths", subjectName: "Mathematics III", dayOfWeek: 5, startTime: "09:00", endTime: "10:00", room: "LT-4", type: "theory", color: "#F59E0B", semester: 3 },
  { id: "13", subjectId: "java", subjectName: "Java Programming Lab", dayOfWeek: 5, startTime: "10:00", endTime: "12:00", room: "Lab-3", type: "lab", color: "#2563EB", semester: 3 },
]

const ATTENDANCE_RECORDS: { subjectId: string; date: string; status: string }[] = []
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

for (let week = 0; week < 4; week++) {
  for (let day = 1; day <= 5; day++) {
    const date = new Date(2026, 6, 27 + week * 7 + day - 1)
    const dateStr = date.toISOString().split("T")[0]
    const today = ["java", "cn", "os", "dbms", "maths"]

    if (day === 1 || day === 3) {
      if (Math.random() > 0.15) ATTENDANCE_RECORDS.push({ subjectId: "os", date: dateStr, status: "present" })
      else ATTENDANCE_RECORDS.push({ subjectId: "os", date: dateStr, status: "absent" })
      if (Math.random() > 0.15) ATTENDANCE_RECORDS.push({ subjectId: "cn", date: dateStr, status: "present" })
      else ATTENDANCE_RECORDS.push({ subjectId: "cn", date: dateStr, status: "absent" })
      if (Math.random() > 0.15) ATTENDANCE_RECORDS.push({ subjectId: "java", date: dateStr, status: "present" })
      else ATTENDANCE_RECORDS.push({ subjectId: "java", date: dateStr, status: "absent" })
    }
    if (day === 2 || day === 4) {
      if (Math.random() > 0.15) ATTENDANCE_RECORDS.push({ subjectId: "dbms", date: dateStr, status: "present" })
      else ATTENDANCE_RECORDS.push({ subjectId: "dbms", date: dateStr, status: "absent" })
    }
    if (day === 2 || day === 5) {
      if (Math.random() > 0.15) ATTENDANCE_RECORDS.push({ subjectId: "maths", date: dateStr, status: "present" })
      else ATTENDANCE_RECORDS.push({ subjectId: "maths", date: dateStr, status: "absent" })
    }
  }
}

async function seed() {
  console.log("Seeding database...")

  for (const s of SUBJECTS) {
    await prisma.subject.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    })
    console.log(`  Subject: ${s.name}`)
  }

  for (const t of TIMETABLE) {
    await prisma.timetableEntry.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    })
  }
  console.log(`  Timetable: ${TIMETABLE.length} entries`)

  await prisma.attendanceRecord.deleteMany()
  for (const r of ATTENDANCE_RECORDS) {
    await prisma.attendanceRecord.create({ data: r })
  }
  console.log(`  Attendance: ${ATTENDANCE_RECORDS.length} records`)

  console.log("Seed complete!")
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
