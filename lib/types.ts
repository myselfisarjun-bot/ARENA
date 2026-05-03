export type UserRole = 'student' | 'admin';

export type Profile = {
  id: string; // uuid
  full_name: string;
  college_email: string;
  game_tags: Record<string, string>;
  role: UserRole;
  created_at: string; // timestamptz
};

export type Team = {
  id: string; // uuid
  name: string;
  game: string;
  captain_id: string; // references profiles.id
  created_at: string; // timestamptz
};

export type TeamMember = {
  team_id: string; // uuid
  user_id: string; // uuid
  joined_at: string; // timestamptz
};

export type TournamentStatus = 
  | 'registration_open'
  | 'registration_closed'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type TournamentFormat = 'single_elimination';

export type Tournament = {
  id: string; // uuid
  name: string;
  game: string;
  format: TournamentFormat;
  max_teams: number;
  prize_pool: string | null;
  status: TournamentStatus;
  starts_at: string; // timestamptz
  bracket_data: any | null; // jsonb
  created_by: string; // references profiles.id
  created_at: string; // timestamptz
};

export type TournamentRegistration = {
  id: string; // uuid
  tournament_id: string; // uuid
  team_id: string; // uuid
  registered_at: string; // timestamptz
  seed: number | null;
};

export type MatchStatus = 'pending' | 'awaiting_result' | 'disputed' | 'completed';

export type MatchRecord = {
  id: string; // uuid
  tournament_id: string; // uuid
  round: number;
  team1_id: string | null; // uuid
  team2_id: string | null; // uuid
  winner_id: string | null; // uuid
  status: MatchStatus;
  scheduled_at: string | null; // timestamptz
  created_at: string; // timestamptz
};

export type MatchResult = {
  id: string; // uuid
  match_id: string; // uuid
  submitted_by_team: string; // references teams.id
  claimed_winner: string; // references teams.id
  screenshot_url: string | null;
  submitted_at: string; // timestamptz
};

export type DisputeStatus = 'open' | 'resolved';

export type Dispute = {
  id: string; // uuid
  match_id: string; // uuid
  raised_by: string; // references profiles.id
  reason: string;
  status: DisputeStatus;
  admin_note: string | null;
  created_at: string; // timestamptz
};
