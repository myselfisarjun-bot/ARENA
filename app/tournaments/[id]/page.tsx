"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BracketView } from "@/components/tournaments/BracketView"
import { auth, db } from "@/lib/firebase/client"
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const [user] = useAuthState(auth)
  const [tournament, setTournament] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [myTeams, setMyTeams] = useState<any[]>([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTourney = async () => {
      const tourDoc = await getDoc(doc(db, 'tournaments', params.id))
      if (!tourDoc.exists()) {
        setLoading(false)
        return
      }
      const tourData = tourDoc.data()
      setTournament({ id: tourDoc.id, ...tourData })

      // Fetch registrations
      const regSnap = await getDocs(query(collection(db, 'tournament_registrations'), where('tournament_id', '==', params.id)))
      const regData = await Promise.all(regSnap.docs.map(async r => {
         const tDoc = await getDoc(doc(db, 'teams', r.data().team_id))
         return { id: r.id, ...r.data(), team: tDoc.exists() ? { id: tDoc.id, ...tDoc.data() } : null }
      }))
      setRegistrations(regData)

      // Fetch user teams if authenticated
      if (user) {
         const mtSnap = await getDocs(query(collection(db, 'teams'), where('captain_id', '==', user.uid), where('game', '==', tourData.game)))
         const mtData = mtSnap.docs.map(d => ({ id: d.id, ...d.data() }))
         setMyTeams(mtData)
         setIsRegistered(mtData.some(mt => regData.some(r => r.team?.id === mt.id)))
      }

      // Fetch matches
      const matchSnap = await getDocs(query(collection(db, 'matches'), where('tournament_id', '==', params.id), orderBy('round', 'asc')))
      const matchData = await Promise.all(matchSnap.docs.map(async m => {
         const mD = m.data()
         const t1Doc = mD.team1_id ? await getDoc(doc(db, 'teams', mD.team1_id)) : null
         const t2Doc = mD.team2_id ? await getDoc(doc(db, 'teams', mD.team2_id)) : null
         const winDoc = mD.winner_id ? await getDoc(doc(db, 'teams', mD.winner_id)) : null
         return { 
           id: m.id, 
           ...mD, 
           t1: t1Doc?.exists() ? { id: t1Doc.id, name: t1Doc.data().name } : null,
           t2: t2Doc?.exists() ? { id: t2Doc.id, name: t2Doc.data().name } : null,
           winner: winDoc?.exists() ? { id: winDoc.id, name: winDoc.data().name } : null
         }
      }))
      setMatches(matchData)
      setLoading(false)
    }

    fetchTourney()
  }, [params.id, user])

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading...</div>
  if (!tournament) return <div className="p-8 text-center text-zinc-500">Tournament not found</div>

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-2/3 border-r border-zinc-800 p-8 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">{tournament.game}</span>
            <span className="text-zinc-500 text-sm font-medium">{tournament.prize_pool || 'No Prize'}</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 leading-none opacity-90">{tournament.name}</h1>
          
          <div className="flex gap-4 items-center mb-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 inline-flex">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Format</span>
              <span className="text-sm font-bold uppercase">{tournament.format.replace('_', ' ')}</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Starts At</span>
              <span className="text-sm font-bold">{new Date(tournament.starts_at).toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Status</span>
              <span className="text-sm font-bold text-red-500 uppercase">{tournament.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
           <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Bracket</h3>
           {tournament.status === 'registration_open' || tournament.status === 'registration_closed' ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 italic">
                Bracket will be generated when the tournament starts.
              </div>
           ) : (
              <BracketView matches={matches || []} />
           )}
        </div>
      </div>

      <div className="w-1/3 bg-zinc-950 flex flex-col border-l border-zinc-800">
        <div className="p-8 border-b border-zinc-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Registration</h2>
          <div className="flex items-center justify-between mb-4">
             <span className="text-sm font-bold">{registrations?.length || 0} / {tournament.max_teams} Teams</span>
             <Badge variant="outline" className="border-zinc-700 bg-zinc-900">{tournament.status === 'registration_open' ? 'Open' : 'Closed'}</Badge>
          </div>
          
          {user ? (
            tournament.status === 'registration_open' ? (
              isRegistered ? (
                 <Button disabled className="w-full bg-zinc-800 text-zinc-500 border-zinc-700 uppercase font-bold text-xs py-3">Already Registered</Button>
              ) : myTeams && myTeams.length > 0 ? (
                 <Link href={`/tournaments/${tournament.id}/register`} className="block">
                   <Button className="w-full bg-white text-black font-bold uppercase py-3 text-xs hover:bg-zinc-200">Register Team</Button>
                 </Link>
              ) : (
                 <div className="text-center">
                   <p className="text-xs text-zinc-500 mb-2">You need to captain a {tournament.game} team to register.</p>
                   <Link href="/teams/create">
                     <Button variant="outline" className="w-full border-zinc-700 uppercase font-bold text-xs py-3">Create Team</Button>
                   </Link>
                 </div>
              )
            ) : null
          ) : (
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-white text-black font-bold uppercase py-3 text-xs hover:bg-zinc-200">Login to Register</Button>
            </Link>
          )}
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Registered Teams</h2>
          {registrations?.length === 0 ? (
            <p className="text-sm text-zinc-500">No teams registered yet.</p>
          ) : (
            <div className="space-y-3">
               {registrations?.map(reg => (
                 <div key={reg.id} className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800 rounded">
                    <Link href={`/teams/${reg.team?.id}`} className="font-bold text-sm hover:text-red-500 transition-colors uppercase">{reg.team?.name || 'Unknown'}</Link>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
