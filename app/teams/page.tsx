import { dbAdmin } from "@/lib/firebase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function TeamsPage({ searchParams }: { searchParams: { game?: string } }) {
  let query: FirebaseFirestore.Query = dbAdmin.collection('teams');
  
  if (searchParams.game && searchParams.game !== "all") {
    query = query.where('game', '==', searchParams.game);
  }
  
  const snapshot = await query.orderBy('created_at', 'desc').get();
  
  const teams = await Promise.all(snapshot.docs.map(async doc => {
    const data = doc.data();
    let captainName = 'Unknown';
    if (data.captain_id) {
       const userSnap = await dbAdmin.collection('profiles').doc(data.captain_id).get();
       captainName = userSnap.data()?.full_name || 'Unknown';
    }
    return { id: doc.id, ...data, captainName };
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto flex-1">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Teams</h1>
          <p className="text-zinc-400 mt-2">Browse and join teams.</p>
        </div>
        <Link href="/teams/create">
          <Button className="bg-white text-black font-bold uppercase hover:bg-zinc-200">Create Team</Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4 items-center bg-zinc-900/50 p-4 border border-zinc-800 rounded-xl">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Filter by Game</span>
        <div className="flex gap-2">
            <Link href="/teams"><Button variant={!searchParams.game || searchParams.game === 'all' ? 'default' : 'outline'} size="sm">All</Button></Link>
            <Link href="/teams?game=valorant"><Button variant={searchParams.game === 'valorant' ? 'default' : 'outline'} size="sm">Valorant</Button></Link>
            <Link href="/teams?game=chess"><Button variant={searchParams.game === 'chess' ? 'default' : 'outline'} size="sm">Chess</Button></Link>
            <Link href="/teams?game=bgmi"><Button variant={searchParams.game === 'bgmi' ? 'default' : 'outline'} size="sm">BGMI</Button></Link>
            <Link href="/teams?game=fifa"><Button variant={searchParams.game === 'fifa' ? 'default' : 'outline'} size="sm">FIFA</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.map((team: any) => (
          <Link href={`/teams/${team.id}`} key={team.id} className="block group">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-red-500 transition-colors">
              <h3 className="text-xl font-bold uppercase mb-2">{team.name}</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 px-2 py-1 bg-zinc-950 rounded uppercase text-[10px] font-bold border border-zinc-800">{team.game}</span>
                <span className="text-zinc-500">Capt: {team.captainName}</span>
              </div>
            </div>
          </Link>
        ))}
        {teams?.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            No teams found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  )
}
