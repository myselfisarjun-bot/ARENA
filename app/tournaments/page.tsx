import { dbAdmin } from "@/lib/firebase/server"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function TournamentsPage() {
  const snapshot = await dbAdmin.collection('tournaments').orderBy('created_at', 'desc').get()
  
  const tournaments = await Promise.all(snapshot.docs.map(async doc => {
    const data = doc.data();
    // Get registrations count
    const regSnapshot = await dbAdmin.collection('tournament_registrations').where('tournament_id', '==', doc.id).get();
    return {
      id: doc.id,
      ...data,
      registrations: regSnapshot.size
    }
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto flex-1 w-full">
      <div className="mb-8 border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tight">Tournaments</h1>
        <p className="text-zinc-400 mt-2">Compete, climb the ranks, and win.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments?.map((t: any) => {
           const registeredCount = t.registrations || 0
           return (
             <Link href={`/tournaments/${t.id}`} key={t.id} className="block group">
               <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-red-500 transition-colors flex flex-col h-full">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                     <Badge variant="outline" className="text-red-500 border-red-500 bg-red-500/10 uppercase font-bold text-[10px]">
                       {t.status.replace(/_/g, ' ')}
                     </Badge>
                     <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{t.game}</span>
                   </div>
                   <span className="text-xs text-zinc-400 font-medium">{new Date(t.starts_at).toLocaleDateString()}</span>
                 </div>
                 
                 <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-red-500 transition-colors">{t.name}</h3>
                 
                 <div className="mt-auto pt-6 border-t border-zinc-800/50 flex justify-between items-center text-sm">
                   <span className="text-zinc-300 font-bold">{t.prize_pool || 'No Prize'}</span>
                   <span className="text-zinc-500 font-medium">{registeredCount} / {t.max_teams} Teams</span>
                 </div>
               </div>
             </Link>
           )
        })}
        {tournaments?.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            No active tournaments found.
          </div>
        )}
      </div>
    </div>
  )
}
