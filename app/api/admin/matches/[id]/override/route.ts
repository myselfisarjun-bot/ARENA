import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id;
    const { winnerId, note } = await request.json();

    const matchRef = dbAdmin.collection('matches').doc(matchId);
    await matchRef.update({ status: 'completed', winner_id: winnerId });
    
    // Also resolve any dispute for this match
    const disputesSnap = await dbAdmin.collection('disputes').where('match_id', '==', matchId).get();
    if (!disputesSnap.empty) {
        const batch = dbAdmin.batch();
        disputesSnap.docs.forEach(doc => {
            batch.update(doc.ref, { status: 'resolved', admin_note: note || '' });
        });
        await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
