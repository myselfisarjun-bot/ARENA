"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auth, db } from "@/lib/firebase/client"
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

const regSchema = z.object({
  teamId: z.string({ required_error: "Please select a team" }),
})

export default function TournamentRegisterPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [teams, setTeams] = useState<any[]>([])
  const [user, loading] = useAuthState(auth)

  const { handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof regSchema>>({
    resolver: zodResolver(regSchema),
  })

  useEffect(() => {
    const checkEligibleTeams = async () => {
      if (loading) return
      if (!user) {
        router.push('/auth/login')
        return
      }

      const tourDoc = await getDoc(doc(db, "tournaments", params.id))
      const tournament = tourDoc.exists() ? tourDoc.data() : null;
      
      if (!tournament || tournament.status !== 'registration_open') {
         setError("Registration is closed")
         setIsLoading(false)
         return
      }

      const q = query(collection(db, "teams"), where("captain_id", "==", user.uid), where("game", "==", tournament.game))
      const myTeamsSnap = await getDocs(q)
      const myTeams = myTeamsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      if (myTeams.length > 0) setTeams(myTeams)
      setIsLoading(false)
    }

    checkEligibleTeams()
  }, [params.id, router, user, loading])

  async function onSubmit(data: z.infer<typeof regSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate
      const tourDoc = await getDoc(doc(db, "tournaments", params.id))
      const tournament = tourDoc.exists() ? tourDoc.data() : null;
      if (!tournament || tournament.status !== 'registration_open') {
         throw new Error("Registration is closed")
      }

      const q = query(collection(db, "tournament_registrations"), where("tournament_id", "==", params.id));
      const regs = await getDocs(q);
      if (regs.size >= tournament.max_teams) {
          throw new Error("Tournament is full");
      }

      await addDoc(collection(db, "tournament_registrations"), {
          tournament_id: params.id,
          team_id: data.teamId,
          registered_at: new Date().toISOString(),
          seed: null
      })

      router.push(`/tournaments/${params.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-24 flex-1">
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Register Team</CardTitle>
          <CardDescription className="text-zinc-400">
            Select which of your teams to register.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Select Team</Label>
              <Select onValueChange={(val) => setValue("teamId", val)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.length === 0 ? (
                     <SelectItem value="none" disabled>No eligible teams found</SelectItem>
                  ) : (
                     teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                     ))
                  )}
                </SelectContent>
              </Select>
              {errors.teamId && <p className="text-sm text-red-500">{errors.teamId.message}</p>}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading || teams.length === 0} className="w-full bg-white text-black font-bold uppercase hover:bg-zinc-200">
              {isLoading ? "Processing..." : "Confirm Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
