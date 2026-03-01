import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  password?: string;
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
  users: User[]; // Centralized list for all registered accounts
  attendance: Record<string, TeamAttendance>;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setAttendance: (workerId: string, members: MemberAttendance[]) => void;
  addCitizenRewards: (citizenId: string, points: number) => void;
}

const initialUsers: User[] = [
  {
    id: 'worker-04',
    password: 'password123',
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
  },
  {
    id: 'comm-1',
    password: 'password123',
    name: 'Dr. Madurai Commissioner',
    role: 'Corporation Commissioner',
    rewardPoints: 0
  },
  {
    id: 'ward-admin-1',
    password: 'password123',
    name: 'Senthil Kumar',
    role: 'Ward Admin',
    wardId: 'ward-1',
    rewardPoints: 0
  },
  {
    id: 'zone-admin-1',
    password: 'password123',
    name: 'Dharshini',
    role: 'Zone Admin',
    zoneId: 'Zone 1 (Central)',
    rewardPoints: 0
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
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
      users: initialUsers,
      attendance: {},
      setCurrentUser: (user) => set({ currentUser: user }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
      })),
      updateUser: (userId, updates) => set((state) => ({
        users: state.users.map((u) => u.id === userId ? { ...u, ...updates } : u)
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
        const updatedUsers = state.users.map(u => 
          u.id === citizenId ? { ...u, rewardPoints: (u.rewardPoints || 0) + points } : u
        );
        const currentUser = state.currentUser?.id === citizenId 
          ? { ...state.currentUser, rewardPoints: (state.currentUser.rewardPoints || 0) + (points || 0) }
          : state.currentUser;
          
        return {
          users: updatedUsers,
          currentUser: currentUser as User | null
        };
      }),
    }),
    {
      name: 'clean-madurai-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
