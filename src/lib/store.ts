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
  name: string; // Leader Name or Citizen Name
  role: UserRole;
  wardId?: string;
  zoneId?: string;
  teamNumber?: string; // Display name like "Team [ID]"
  rewardPoints: number;
  members?: TeamMember[];
  age?: number;
  contactNumber?: string;
  address?: string;
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
  assignedTo?: string; // Worker User ID
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
  citizens: User[]; // Track citizens for rewards
  attendance: Record<string, TeamAttendance>;
  setCurrentUser: (user: User | null) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTeam: (team: User) => void;
  updateTeam: (workerId: string, updates: Partial<User>) => void;
  setAttendance: (workerId: string, members: MemberAttendance[]) => void;
  addCitizenRewards: (citizenId: string, points: number) => void;
}

const initialTeams: User[] = [
  {
    id: 'worker-04',
    name: 'Karthik',
    role: 'Worker',
    teamNumber: 'Team worker-04',
    zoneId: 'Zone 4 (Vaikunth Nagar)',
    rewardPoints: 450,
    age: 28,
    contactNumber: '9876543210',
    address: '12, West St, Madurai',
    members: [
      { id: 'm1', name: 'Siva', age: 32, contactNumber: '9876543211', address: '45, East St, Madurai' },
      { id: 'm2', name: 'Meena', age: 26, contactNumber: '9876543212', address: '7, South St, Madurai' }
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
      createdAt: '2024-01-01T00:00:00.000Z',
    }
  ],
  teams: initialTeams,
  citizens: [],
  attendance: {},
  setCurrentUser: (user) => set({ currentUser: user }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
  })),
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (workerId, updates) => set((state) => ({
    teams: state.teams.map((t) => t.id === workerId ? { ...t, ...updates } : t)
  })),
  setAttendance: (workerId, members) => set((state) => ({
    attendance: {
      ...state.attendance,
      [workerId]: {
        teamNumber: workerId,
        date: new Date().toLocaleDateString(),
        members
      }
    }
  })),
  addCitizenRewards: (citizenId, points) => set((state) => {
    const isCurrentUser = state.currentUser?.id === citizenId;
    const updatedUser = isCurrentUser && state.currentUser 
      ? { ...state.currentUser, rewardPoints: (state.currentUser.rewardPoints || 0) + points }
      : state.currentUser;
      
    return {
      currentUser: updatedUser
    };
  }),
}));
