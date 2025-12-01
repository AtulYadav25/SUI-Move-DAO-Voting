export type Role = 'ADMIN' | 'MEMBER';

export interface Member {
  address: string;
  role: Role;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creator: string;
  yes: number;
  no: number;
  deadline: number; // timestamp
  isClosed: boolean;
  userVote?: 'yes' | 'no'; // Local state for user's vote
}

export interface DAO {
  id: string;
  title: string;
  description: string;
  daoStates: DAOStates
}

export interface DAOStates {
  members: string[],
  proposals: string[],
  admins: string[],
}

export interface User {
  address: string;
  isConnected: boolean;
}