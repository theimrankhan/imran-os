import { useEffect } from "react"
import { useRouter } from "../lib/router"

export default function AIAssistantPage() {
  const { navigate } = useRouter()
  useEffect(() => { navigate("/notes") }, [])
  return null
}
