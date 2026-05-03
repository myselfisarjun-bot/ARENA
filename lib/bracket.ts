import { BracketsManager } from 'brackets-manager';
import { InMemoryDatabase } from 'brackets-memory-db';

export async function generateBracket(tournamentId: string, teamIds: string[]) {
  const storage = new InMemoryDatabase();
  const manager = new BracketsManager(storage);

  await manager.create({
    name: 'Main Bracket',
    tournamentId: tournamentId as any,
    type: 'single_elimination',
    seeding: teamIds,
    settings: { seedOrdering: ['inner_outer'], size: teamIds.length }
  });

  const data = await manager.get.tournamentData(tournamentId as any);
  return data;
}
