"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

const resultSchema = z.object({
  claimedWinner: z.string({ required_error: "Please select the winner." }),
  screenshotUrl: z.string().optional(), // We'll just ask for a URL for MVP since storage uploads require setting up buckets in Firebase explicitly, which might fail if not fully configured.
})

export function ResultForm({ matchId, team1, team2, myTeamId }: { matchId: string, team1: any, team2: any, myTeamId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof resultSchema>>({
    resolver: zodResolver(resultSchema),
  })

  async function onSubmit(data: z.infer<typeof resultSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/matches/${matchId}/submit-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, submittedByTeam: myTeamId })
      })
      const result = await res.json()

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to submit result')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2 text-sm">
        <Label>Who won?</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer p-4 border border-zinc-800 rounded bg-zinc-950 hover:border-zinc-500 w-full">
            <input type="radio" value={team1.id} {...register("claimedWinner")} />
            {team1.name}
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-4 border border-zinc-800 rounded bg-zinc-950 hover:border-zinc-500 w-full">
            <input type="radio" value={team2.id} {...register("claimedWinner")} />
            {team2.name}
          </label>
        </div>
        {errors.claimedWinner && <p className="text-sm text-red-500">{errors.claimedWinner.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="screenshotUrl">Evidence URL (Optional)</Label>
        <Input
          id="screenshotUrl"
          placeholder="https://imgur.com/..."
          className="bg-zinc-950 border-zinc-800"
          {...register("screenshotUrl")}
        />
        <p className="text-[10px] text-zinc-500">Provide a link to a screenshot confirming the result.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading} className="w-full bg-white text-black font-bold uppercase hover:bg-zinc-200">
        {isLoading ? "Submitting..." : "Submit Result"}
      </Button>
    </form>
  )
}
