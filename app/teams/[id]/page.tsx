"use client"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase/client"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { Badge } from "@/components/ui/badge"
import { JoinTeamButton, ApproveMemberButton } from "@/components/teams/TeamActionButtons"

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const [user] = useAuthState(auth)
  const [team, setTeam] = useState<any>(null)
  const [captainInfo, setCaptainInfo] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      const teamDoc = await getDoc(doc(db, "teams", params.id))
      if (teamDoc.exists()) {
        const teamData = { id: teamDoc.id, ...teamDoc.data() } as any
        setTeam(teamData)

        // get captain info
        if (teamData.captain_id) {
           const capDoc = await getDoc(doc(db, "profiles", teamData.captain_id))
           if (capDoc.exists()) setCaptainInfo(capDoc.data())
        }

        // get members
        const membersSnapshot = await getDocs(query(collection(db, "team_members"), where("team_id", "==", params.id)))
        const membersData = await Promise.all(membersSnapshot.docs.map(async mDoc => {
           const mData = mDoc.data() as any
           const pDoc = await getDoc(doc(db, "profiles", mData.user_id))
           return { id: mDoc.id, ...mData, profile: pDoc.exists() ? pDoc.data() : null }
        }))
        setMembers(membersData)
      }
      setLoading(false)
    }
    fetchTeam()
  }, [params.id])

  if (loading) return <div className="p-8 text-center">Loading team...</div>
  if (!team) return <div className="p-8 text-center">Team not found</div>

  const isCaptain = user?.uid === team.captain_id
  const currentUserMember = members.find(m => m.user_id === user?.uid)
  
  const approvedMembers = members.filter(m => m.status === 'approved')
  const pendingMembers = members.filter(m => m.status === 'pending')

  return (
    <div className="p-8 max-w-4xl mx-auto flex-1 w-full">
      <div className="mb-8 border-b border-zinc-800 pb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">{team.game}</span>
            <span className="text-zinc-500 text-sm font-medium">Created on {new Date(team.created_at).toLocaleDateString()}</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">{team.name}</h1>
        </div>
        
        <div>
          {user && !isCaptain && !currentUserMember && (
             <JoinTeamButton teamId={team.id} />
          )}
          {user && !isCaptain && currentUserMember?.status === 'pending' && (
             <Badge variant="outline" className="text-yellow-500 border-yellow-500 bg-yellow-500/10">Request Pending</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Roster ({approvedMembers.length}/5)</h2>
          <div className="space-y-4">
            {approvedMembers.map(member => (
              <div key={member.user_id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded">
                 <div>
                   <p className="font-bold flex items-center gap-2">
                     {member.profile?.full_name || 'Unknown'} 
                     {team.captain_id === member.user_id && <Badge variant="outline" className="text-[10px] uppercase text-yellow-500 border-yellow-500">Captain</Badge>}
                   </p>
                   <p className="text-xs text-zinc-500 mt-1">
                     Game Tag: {(member.profile?.game_tags || {})[team.game] || 'Not set'}
                   </p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {isCaptain && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Pending Requests</h2>
            {pendingMembers.length === 0 ? (
               <p className="text-sm text-zinc-500 italic">No pending requests</p>
            ) : (
               <div className="space-y-4">
                 {pendingMembers.map(member => (
                   <div key={member.user_id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded">
                     <div>
                       <p className="font-bold text-sm">{member.profile?.full_name || 'Unknown'}</p>
                     </div>
                     <ApproveMemberButton teamId={team.id} userId={member.user_id} membershipId={member.id} />
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
