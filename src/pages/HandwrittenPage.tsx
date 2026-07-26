import { useEffect } from "react"
import { useRouter } from "../lib/router"

export default function HandwrittenPage() {
  const { navigate } = useRouter()
  useEffect(() => { navigate("/notes") }, [])
  return null
}
