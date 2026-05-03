"use client"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase/client"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { Badge } from "@/components/ui/badge"
import { ResultForm } from "@/components/matches/ResultForm"

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const [user] = useAuthState(auth)
  const [match, setMatch] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [userTeamIds, setUserTeamIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

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
       const tourDoc = matchData.tournament_id ? await getDoc(doc(db, "tournaments", matchData.tournament_id)) : null

       setMatch({
           id: matchDoc.id,
           ...matchData,
           t1: t1Doc?.exists() ? { id: t1Doc.id, ...t1Doc.data() } : null,
           t2: t2Doc?.exists() ? { id: t2Doc.id, ...t2Doc.data() } : null,
           tournament: tourDoc?.exists() ? { id: tourDoc.id, name: tourDoc.data().name } : null
       })

       // Fetch results
       const resultsSnap = await getDocs(query(collection(db, "match_results"), where("match_id", "==", params.id)))
       const resultsData = await Promise.all(resultsSnap.docs.map(async r => {
           const rD = r.data()
           const subT = await getDoc(doc(db, "teams", rD.submitted_by_team))
           const claimT = await getDoc(doc(db, "teams", rD.claimed_winner))
           return {
               id: r.id,
               ...rD,
               submitted_team: subT.exists() ? { id: subT.id, name: subT.data().name } : null,
               claimed_win: claimT.exists() ? { id: claimT.id, name: claimT.data().name } : null
           }
       }))
       setResults(resultsData)

       // If user is here, fetch their teams
       if (user) {
          const myTeamsSnap = await getDocs(query(collection(db, "team_members"), where("user_id", "==", user.uid), where("status", "==", "approved")))
          setUserTeamIds(myTeamsSnap.docs.map(t => t.data().team_id))
       }

       setLoading(false)
    }

    fetchMatch()
  }, [params.id, user])

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading...</div>
  if (!match) return <div className="p-8 text-center text-zinc-500">Match not found</div>


  const isT1Member = match.team1_id && userTeamIds.includes(match.team1_id)
  const isT2Member = match.team2_id && userTeamIds.includes(match.team2_id)
  const isParticipant = isT1Member || isT2Member

  const myTeamId = isT1Member ? match.team1_id : (isT2Member ? match.team2_id : null)
  const mySubmission = results.find(r => r.submitted_by_team === myTeamId)

  return (
    <div className="p-8 max-w-4xl mx-auto flex-1 w-full flex flex-col gap-8">
      <div className="border-b border-zinc-800 pb-8 text-center bg-zinc-900/30 rounded-xl p-8 border border-zinc-800">
         <span className="text-xs uppercase font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded mb-4 inline-block">{match.status.replace(/_/g, ' ')}</span>
         <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Round {match.round} • {match.tournament?.name}</h2>
         
         <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-right flex-1">
               <h3 className="text-3xl font-black uppercase text-white">{match.t1?.name || 'TBD'}</h3>
            </div>
            <div className="text-zinc-500 font-bold italic">VS</div>
            <div className="text-left flex-1">
               <h3 className="text-3xl font-black uppercase text-white">{match.t2?.name || 'TBD'}</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Submissions</h3>
            {results?.length === 0 ? (
               <p className="text-sm text-zinc-500 italic">No results submitted yet.</p>
            ) : (
               <div className="space-y-4">
                  {results?.map(res => (
                     <div key={res.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded text-sm">
                        <p><span className="text-zinc-500">Submitted by:</span> <span className="font-bold">{res.submitted_team?.name}</span></p>
                        <p><span className="text-zinc-500">Claimed Winner:</span> <span className="font-bold text-green-500">{res.claimed_win?.name}</span></p>
                        {res.screenshot_url && <a href={res.screenshot_url} target="_blank" className="text-blue-500 underline mt-2 block text-xs">View Evidence</a>}
                     </div>
                  ))}
               </div>
            )}
         </div>

         <div>
           {isParticipant && match.status !== 'completed' && match.t1 && match.t2 && !mySubmission ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Submit Result</h3>
                 <ResultForm matchId={match.id} team1={match.t1} team2={match.t2} myTeamId={myTeamId!} />
              </div>
           ) : isParticipant && mySubmission ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center items-center h-full text-center">
                 <p className="font-bold text-green-500 uppercase tracking-widest mb-2">Result Submitted</p>
                 <p className="text-xs text-zinc-400">Waiting for opponent or admin review.</p>
              </div>
           ) : null}
         </div>
      </div>
    </div>
  )
}
