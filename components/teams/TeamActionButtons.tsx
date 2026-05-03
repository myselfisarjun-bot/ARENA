"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { auth, db } from "@/lib/firebase/client"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"

export function JoinTeamButton({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [user] = useAuthState(auth)

  const handleJoin = async () => {
    if (!user) return
    setLoading(true)
    try {
      await addDoc(collection(db, "team_members"), {
        team_id: teamId,
        user_id: user.uid,
        status: "pending",
        joined_at: new Date().toISOString()
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleJoin} disabled={loading} className="bg-white text-black font-bold uppercase hover:bg-zinc-200">
      {loading ? "Requesting..." : "Request to Join"}
    </Button>
  )
}

export function ApproveMemberButton({ teamId, userId, membershipId }: { teamId: string, userId: string, membershipId?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      // If we don't have membershipId passed, we need to query for it, but ideally we pass it
      let idToUse = membershipId;
      if (!idToUse) {
         const q = query(collection(db, "team_members"), where("team_id", "==", teamId), where("user_id", "==", userId));
         const snapshot = await getDocs(q);
         if (!snapshot.empty) idToUse = snapshot.docs[0].id;
      }
      
      if (idToUse) {
         if (action === 'approve') {
            await updateDoc(doc(db, "team_members", idToUse), { status: "approved" });
         } else {
            await deleteDoc(doc(db, "team_members", idToUse));
         }
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleAction('approve')} disabled={loading} size="sm" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white">✓</Button>
      <Button onClick={() => handleAction('reject')} disabled={loading} size="sm" variant="outline" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">✕</Button>
    </div>
  )
}
