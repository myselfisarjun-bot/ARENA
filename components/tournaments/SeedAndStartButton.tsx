"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function SeedAndStartButton({ tournamentId }: { tournamentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/seed-and-start`, { method: 'POST' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleStart} disabled={loading} size="sm" className="bg-red-600 text-white hover:bg-red-700 font-bold uppercase text-[10px]">
      {loading ? "Starting..." : "Seed & Start"}
    </Button>
  )
}
