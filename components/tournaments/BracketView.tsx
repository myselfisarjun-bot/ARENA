"use client"

import Link from "next/link"

export function BracketView({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) {
     return <div className="p-8 text-center text-zinc-500 italic">Bracket empty.</div>
  }

  // Group by round
  const roundsMap: Record<number, any[]> = {}
  matches.forEach(m => {
     if (!roundsMap[m.round]) roundsMap[m.round] = []
     roundsMap[m.round].push(m)
  })

  // Object keys might be strings, let's sort them numerically
  const roundNumbers = Object.keys(roundsMap).map(Number).sort((a,b) => a - b)

  return (
    <div className="flex gap-16 items-center overflow-x-auto pb-8">
      {roundNumbers.map((roundIdx, i) => (
         <div key={roundIdx} className="flex flex-col gap-8 relative shrink-0">
           {roundsMap[roundIdx].map((match, j) => (
             <Link key={match.id} href={`/matches/${match.id}`} className="relative group z-10 block">
               <div className="w-48 bg-zinc-900 border border-zinc-800 hover:border-red-500 transition-colors rounded p-3 shadow-lg group-hover:bg-zinc-800">
                 <div className="flex flex-col gap-2">
                   <div className="flex justify-between text-xs">
                     <span className={match.winner_id === match.team1_id ? "font-bold text-white" : "text-zinc-400"}>
                        {match.t1?.name || (match.team1_id ? 'Unknown' : 'TBD')}
                     </span>
                   </div>
                   <div className="h-px w-full bg-zinc-800" />
                   <div className="flex justify-between text-xs">
                     <span className={match.winner_id === match.team2_id ? "font-bold text-white" : "text-zinc-400"}>
                        {match.t2?.name || (match.team2_id ? 'Unknown' : 'TBD')}
                     </span>
                   </div>
                 </div>
                 {/* Connection line placeholder - visually connecting rounds in pure flex is hard to do perfectly without absolute positioning, but we'll leave it simple for MVP */}
               </div>
               
               {/* Connector line to next round if not last round */}
               {i < roundNumbers.length - 1 && (
                 <div className="hidden md:block absolute -right-8 top-1/2 w-8 h-px bg-zinc-700" />
               )}
             </Link>
           ))}
         </div>
      ))}
    </div>
  )
}
