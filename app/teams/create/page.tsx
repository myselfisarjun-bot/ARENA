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
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(30),
  game: z.enum(["valorant", "chess", "bgmi", "fifa"], { required_error: "Please select a game" }),
})

type FormData = z.infer<typeof teamSchema>

export default function CreateTeamPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [user] = useAuthState(auth)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(teamSchema),
  })

  async function onSubmit(data: FormData) {
    if (!user) return
    setIsLoading(true)
    setError(null)
    
    try {
      const teamDocRef = await addDoc(collection(db, "teams"), {
        name: data.name,
        game: data.game,
        captain_id: user.uid,
        created_at: new Date().toISOString()
      });

      // Add captain to team_members
      await addDoc(collection(db, "team_members"), {
        team_id: teamDocRef.id,
        user_id: user.uid,
        status: "approved",
        joined_at: new Date().toISOString()
      });

      router.push(`/teams/${teamDocRef.id}`)
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
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Create Team</CardTitle>
          <CardDescription className="text-zinc-400">
            Form your squad and prepare for battle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="Team Void"
                className="bg-zinc-950 border-zinc-800"
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

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
              {errors.game && <p className="text-sm text-red-500">{errors.game.message}</p>}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-white text-black font-bold uppercase hover:bg-zinc-200">
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
