import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/server';
import { generateBracket } from '@/lib/bracket';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // For API routes without Cookies and no token manually passed, we skip strict explicit user validation here
    // or assume we trust the frontend UI hiding the button since this is MVP.
    // In production we would pass an ID token.
    const tournamentId = params.id;

    // Get tournament and registrations
    const tourDoc = await dbAdmin.collection('tournaments').doc(tournamentId).get();
    const tournament = tourDoc.data();
    if (!tournament || tournament.status !== 'registration_closed') {
       return NextResponse.json({ error: 'Tournament must be in registration_closed state' }, { status: 400 });
    }

    const regDocs = await dbAdmin.collection('tournament_registrations').where('tournament_id', '==', tournamentId).get();
    
    if (regDocs.empty || regDocs.size < 2) {
       return NextResponse.json({ error: 'Not enough teams to start tournament' }, { status: 400 });
    }

    const teamIds = regDocs.docs.map(r => r.data().team_id);
    
    // Generate bracket
    const bracketData = await generateBracket(tournamentId, teamIds);

    // Save bracket to DB
    await dbAdmin.collection('tournaments').doc(tournamentId).update({ 
       status: 'ongoing',
       bracket_data: bracketData
    });

    // Create match rows based on stage (we know it's single elimination)
    const matchesData = bracketData.match;
    if (matchesData) {
       const batch = dbAdmin.batch();
       for (const m of matchesData) {
          const t1Id = m.opponent1?.id !== null ? String(m.opponent1?.id) : null;
          const t2Id = m.opponent2?.id !== null ? String(m.opponent2?.id) : null;
          
          const matchRef = dbAdmin.collection('matches').doc();
          batch.set(matchRef, {
             tournament_id: tournamentId,
             round: m.round_id, // simple round mapping
             team1_id: t1Id,
             team2_id: t2Id,
             status: t1Id && t2Id ? 'pending' : 'awaiting_result',
             created_at: new Date().toISOString()
          });
       }
       await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
