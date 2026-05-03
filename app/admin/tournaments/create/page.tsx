"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auth, db } from "@/lib/firebase/client"
import { doc, getDoc, collection, addDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

const tourneySchema = z.object({
  name: z.string().min(3),
  game: z.enum(["valorant", "chess", "bgmi", "fifa"]),
  max_teams: z.number().min(2).max(64),
  prize_pool: z.string().optional(),
  starts_at: z.string()
})

type FormData = z.infer<typeof tourneySchema>

export default function CreateTournamentPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [user] = useAuthState(auth)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(tourneySchema),
    defaultValues: { max_teams: 8 }
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!user) throw new Error("Unauthorized")

      const profileDoc = await getDoc(doc(db, "profiles", user.uid))
      const profile = profileDoc.exists() ? profileDoc.data() : null
      if (profile?.role !== 'admin') throw new Error("Unauthorized: Admins only")

      await addDoc(collection(db, "tournaments"), {
        name: data.name,
        game: data.game,
        format: 'single_elimination',
        max_teams: data.max_teams,
        prize_pool: data.prize_pool,
        starts_at: new Date(data.starts_at).toISOString(),
        created_by: user.uid,
        status: 'registration_open',
        created_at: new Date().toISOString()
      })

      router.push(`/admin`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-xl mx-auto py-24 flex-1">
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-red-500">Create Tournament</CardTitle>
          <CardDescription className="text-zinc-400">
            Initialize a new event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                placeholder="NIT Valorant Season 4"
                className="bg-zinc-950 border-zinc-800"
                {...register("name")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="game">Game</Label>
                 <Select onValueChange={(val) => setValue("game", val as any)}>
                   <SelectTrigger className="bg-zinc-950 border-zinc-800">
                     <SelectValue placeholder="Select a game" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="valorant">Valorant</SelectItem>
                     <SelectItem value="chess">Chess</SelectItem>
                     <SelectItem value="bgmi">BGMI</SelectItem>
                     <SelectItem value="fifa">FIFA</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="max_teams">Max Teams</Label>
                 <Input
                   id="max_teams"
                   type="number"
                   className="bg-zinc-950 border-zinc-800"
                   {...register("max_teams", { valueAsNumber: true })}
                 />
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize_pool">Prize Pool</Label>
              <Input
                id="prize_pool"
                placeholder="₹5000 + Certificate"
                className="bg-zinc-950 border-zinc-800"
                {...register("prize_pool")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date & Time</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                className="bg-zinc-950 border-zinc-800 invert-0 dark:[color-scheme:dark]"
                {...register("starts_at")}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-red-600 text-white hover:bg-red-700 font-bold uppercase">
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
