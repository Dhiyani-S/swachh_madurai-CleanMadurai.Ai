
import { create } from 'zustand';

export type UserRole = 'Corporation Commissioner' | 'Ward Admin' | 'Zone Admin' | 'Worker' | 'Citizen';

export interface TeamMember {
  id: string;
  name: string;
  age: number;
  contactNumber: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  wardId?: string;
  zoneId?: string;
  teamNumber?: string;
  rewardPoints?: number;
  members?: TeamMember[];
}

export type TaskType = 'Sensor' | 'Citizen Public' | 'Citizen Private';
export type SensorSubType = 'Dustbin' | 'Drainage' | 'Water' | 'Toilet' | 'Napkin';

export interface Task {
  id: string;
  name: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Partially Completed' | 'Completed';
  type: TaskType;
  subType?: SensorSubType;
  assignedTo?: string; // Team Number
  wardId: string;
  zoneId: string;
  createdAt: string;
  imageProof?: string;
  paymentStatus?: 'Unpaid' | 'Paid';
  citizenId?: string;
}

export interface SensorAlert {
  id: string;
  type: SensorSubType;
  location: string;
  wardId: string;
  zoneId: string;
  timestamp: string;
}

export interface MemberAttendance {
  name: string;
  status: 'Present' | 'Absent';
}

export interface TeamAttendance {
  teamNumber: string;
  date: string;
  members: MemberAttendance[];
}

interface AppState {
  currentUser: User | null;
  tasks: Task[];
  teams: User[]; // List of worker teams in the zone
  attendance: Record<string, TeamAttendance>;
  setCurrentUser: (user: User | null) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTeam: (team: User) => void;
  updateTeam: (teamNumber: string, updates: Partial<User>) => void;
  setAttendance: (teamNumber: string, members: MemberAttendance[]) => void;
}

const initialTeams: User[] = [
  {
    id: 'team-04',
    name: 'Karthik (Lead)',
    role: 'Worker',
    teamNumber: 'Team 04',
    zoneId: 'Zone 4 (Vaikunth Nagar)',
    rewardPoints: 450,
    members: [
      { id: 'm1', name: 'Karthik', age: 28, contactNumber: '9876543210', address: '12, West St, Madurai' },
      { id: 'm2', name: 'Siva', age: 32, contactNumber: '9876543211', address: '45, East St, Madurai' }
    ]
  },
  {
    id: 'team-08',
    name: 'Meena (Lead)',
    role: 'Worker',
    teamNumber: 'Team 08',
    zoneId: 'Zone 4 (Vaikunth Nagar)',
    rewardPoints: 320,
    members: [
      { id: 'm3', name: 'Meena', age: 26, contactNumber: '9876543212', address: '7, South St, Madurai' }
    ]
  }
];

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  tasks: [
    {
      id: 'task-1',
      name: 'Work-Dispose Waste',
      location: 'Meenakshi Temple Gate',
      status: 'Pending',
      type: 'Sensor',
      subType: 'Dustbin',
      wardId: 'ward-1',
      zoneId: 'Zone 4 (Vaikunth Nagar)',
      createdAt: new Date().toISOString(),
    }
  ],
  teams: initialTeams,
  attendance: {},
  setCurrentUser: (user) => set({ currentUser: user }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
  })),
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (teamNumber, updates) => set((state) => ({
    teams: state.teams.map((t) => t.teamNumber === teamNumber ? { ...t, ...updates } : t)
  })),
  setAttendance: (teamNumber, members) => set((state) => ({
    attendance: {
      ...state.attendance,
      [teamNumber]: {
        teamNumber,
        date: new Date().toLocaleDateString(),
        members
      }
    }
  })),
}));
