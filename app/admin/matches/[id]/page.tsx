"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { auth, db } from "@/lib/firebase/client"
import { doc, getDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

export default function AdminMatchOverridePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [match, setMatch] = useState<any>(null)
  const [winnerId, setWinnerId] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [user, userLoading] = useAuthState(auth)

  useEffect(() => {
    const fetchMatch = async () => {
      const matchDoc = await getDoc(doc(db, "matches", params.id))
      if (!matchDoc.exists()) {
         setLoading(false)
         return
      }

      const matchData = matchDoc.data();
      const t1Doc = matchData.team1_id ? await getDoc(doc(db, "teams", matchData.team1_id)) : null
      const t2Doc = matchData.team2_id ? await getDoc(doc(db, "teams", matchData.team2_id)) : null

      setMatch({
         ...matchData,
         t1: t1Doc?.exists() ? { id: t1Doc.id, name: t1Doc.data().name } : null,
         t2: t2Doc?.exists() ? { id: t2Doc.id, name: t2Doc.data().name } : null
      })
      setLoading(false)
    }
    fetchMatch()
  }, [params.id])

  const handleOverride = async () => {
    if (!winnerId) return alert('Select winner')
    setLoading(true)
    const res = await fetch(`/api/admin/matches/${params.id}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId, note })
    })
    if (res.ok) {
       router.push('/admin')
    } else {
       setLoading(false)
       alert('Failed')
    }
  }

  if (loading || userLoading) return <div className="p-8">Loading...</div>
  if (!match) return <div className="p-8">Match not found</div>

  return (
    <div className="container max-w-xl mx-auto py-24 flex-1">
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-red-500">Admin Override</CardTitle>
          <CardDescription className="text-zinc-400">Resolve dispute for Match #{params.id.slice(0,8)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select True Winner</Label>
            <Select onValueChange={setWinnerId}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {match.t1 && <SelectItem value={match.t1.id}>{match.t1.name}</SelectItem>}
                {match.t2 && <SelectItem value={match.t2.id}>{match.t2.name}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <Label>Admin Note (Optional)</Label>
             <Textarea value={note} onChange={e => setNote(e.target.value)} className="bg-zinc-950 border-zinc-800" />
          </div>
          <Button onClick={handleOverride} disabled={loading || !winnerId} className="w-full bg-red-600 text-white hover:bg-red-700 font-bold uppercase">
            Force Resolve
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
