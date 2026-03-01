
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import initialData from './initial-dataset.json';

export type UserRole = 'Corporation Commissioner' | 'Ward Admin' | 'Zone Admin' | 'Worker' | 'Citizen';
export type AppLanguage = 'en' | 'ta';

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
  teamMembers?: string[]; // Simplified member names for fallback
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
  assignedAt?: string; // ISO Timestamp when assigned
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
  language: AppLanguage | null;
  setCurrentUser: (user: User | null) => void;
  setLanguage: (lang: AppLanguage) => void;
  addUser: (user: User) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setAttendance: (workerId: string, members: MemberAttendance[]) => void;
  addCitizenRewards: (citizenId: string, points: number) => void;
  resetToDataset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      tasks: (initialData.tasks as Task[]),
      users: (initialData.users as User[]),
      attendance: {},
      language: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      setLanguage: (lang) => set({ language: lang }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map((t) => {
          if (t.id === taskId) {
            const updatedTask = { ...t, ...updates };
            // If the task is being assigned, record the timestamp
            if (updates.assignedTo && !t.assignedTo) {
              updatedTask.assignedAt = new Date().toISOString();
            }
            // If the task is being unassigned, clear the timestamp
            if (updates.assignedTo === undefined && t.assignedTo) {
              updatedTask.assignedAt = undefined;
            }
            return updatedTask;
          }
          return t;
        })
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
      resetToDataset: () => set({ 
        tasks: (initialData.tasks as Task[]), 
        users: (initialData.users as User[]),
        attendance: {},
        currentUser: null,
        language: null
      })
    }),
    {
      name: 'clean-madurai-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
