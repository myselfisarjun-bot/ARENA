import { dbAdmin } from "@/lib/firebase/server"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SeedAndStartButton } from "@/components/tournaments/SeedAndStartButton"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  // Stats
  const usersSnap = await dbAdmin.collection('profiles').count().get()
  const usersCount = usersSnap.data().count

  const tourneySnap = await dbAdmin.collection('tournaments').where('status', 'in', ['registration_open', 'ongoing']).count().get()
  const tournamentsCount = tourneySnap.data().count

  const disputesSnap = await dbAdmin.collection('disputes').where('status', '==', 'open').count().get()
  const openDisputes = disputesSnap.data().count

  const matchesSnap = await dbAdmin.collection('matches').where('status', 'in', ['awaiting_result', 'disputed']).count().get()
  const pendingMatches = matchesSnap.data().count

  // Tournaments list
  const tournamentsData = await dbAdmin.collection('tournaments').orderBy('created_at', 'desc').get()
  const tournaments = tournamentsData.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  return (
    <div className="p-8 flex-1">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-red-500">Admin Command</h1>
            <p className="text-zinc-400 mt-2">Manage tournaments, resolve disputes, and oversee the platform.</p>
          </div>
          <Link href="/admin/tournaments/create">
            <Button className="bg-white text-black font-bold uppercase hover:bg-zinc-200">New Tournament</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center">
              <p className="text-3xl font-black">{usersCount}</p>
              <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mt-2">Total Users</p>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center">
              <p className="text-3xl font-black">{tournamentsCount}</p>
              <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mt-2">Active Events</p>
           </div>
           <div className="bg-zinc-900 border border-red-900/50 p-6 rounded-xl text-center">
              <p className="text-3xl font-black text-red-500">{openDisputes}</p>
              <p className="text-[10px] font-bold uppercase text-red-500 tracking-widest mt-2">Open Disputes</p>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center">
              <p className="text-3xl font-black">{pendingMatches}</p>
              <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mt-2">Matches Awaiting</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
             <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Tournament Management</h2>
             <div className="space-y-4">
                 {tournaments?.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded group">
                       <div className="flex items-center gap-4">
                         <Badge variant="outline" className="text-zinc-400 border-zinc-700 bg-zinc-900 uppercase min-w-[120px] text-center justify-center">
                           {t.status.replace(/_/g, ' ')}
                         </Badge>
                         <span className="font-bold uppercase tracking-tight">{t.name}</span>
                       </div>
                       <div className="flex gap-2">
                         {t.status === 'registration_open' && (
                            <form action={async () => {
                                'use server'
                                await dbAdmin.collection('tournaments').doc(t.id).update({ status: 'registration_closed' })
                                revalidatePath('/admin');
                            }}>
                               <Button type="submit" size="sm" variant="outline" className="border-zinc-700">Close Reg</Button>
                            </form>
                         )}
                         {t.status === 'registration_closed' && (
                            <SeedAndStartButton tournamentId={t.id} />
                         )}
                       </div>
                    </div>
                 ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
