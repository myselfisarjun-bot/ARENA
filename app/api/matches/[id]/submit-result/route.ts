import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id;
    const { claimedWinner, screenshotUrl, submittedByTeam } = await request.json();

    // Verify submission validity
    const matchRef = dbAdmin.collection('matches').doc(matchId);
    const matchDoc = await matchRef.get();
    
    if (!matchDoc.exists) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    const match = matchDoc.data()!;
    if (match.status === 'completed') return NextResponse.json({ error: 'Match is already completed' }, { status: 400 });

    const resultRef = dbAdmin.collection('match_results').doc();
    await resultRef.set({
      match_id: matchId,
      submitted_by_team: submittedByTeam,
      claimed_winner: claimedWinner,
      screenshot_url: screenshotUrl || '',
      created_at: new Date().toISOString()
    });

    // Check auto-resolution
    const resultsSnap = await dbAdmin.collection('match_results').where('match_id', '==', matchId).get();
    const results = resultsSnap.docs.map(doc => doc.data());

    if (results.length >= 2) {
       // Both submitted
       if (results[0].claimed_winner === results[1].claimed_winner) {
          // Agreement -> Completed
          const winner = results[0].claimed_winner;
          await matchRef.update({ status: 'completed', winner_id: winner });
       } else {
          // Conflict -> Disputed
          await matchRef.update({ status: 'disputed' });
          await dbAdmin.collection('disputes').doc().set({
             match_id: matchId,
             raised_by: 'system',
             reason: 'Automatic dispute: Results conflict.',
             status: 'open',
             created_at: new Date().toISOString()
          });
       }
    } else {
       await matchRef.update({ status: 'awaiting_result' });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
