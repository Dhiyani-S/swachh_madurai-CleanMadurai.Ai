
import { create } from 'zustand';

export type UserRole = 'Corporation Commissioner' | 'Ward Admin' | 'Zone Admin' | 'Worker' | 'Citizen';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  wardId?: string;
  zoneId?: string;
  teamNumber?: string;
  rewardPoints?: number;
  teamMembers?: string[];
}

export interface Task {
  id: string;
  name: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Partially Completed' | 'Completed';
  type: 'Sensor' | 'Citizen Public' | 'Citizen Private';
  assignedTo?: string; // Team Number or Zone Admin
  wardId: string;
  zoneId: string;
  createdAt: string;
  imageProof?: string;
}

export interface SensorAlert {
  id: string;
  type: 'Dustbin Overflow' | 'Water Leakage' | 'Drainage Leakage' | 'Toilet Stock Level' | 'Water Tank Level';
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
  sensorAlerts: SensorAlert[];
  attendance: Record<string, TeamAttendance>; // Key: teamNumber
  setCurrentUser: (user: User | null) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addAlert: (alert: SensorAlert) => void;
  setAttendance: (teamNumber: string, members: MemberAttendance[]) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  tasks: [
    {
      id: 'task-1',
      name: 'Dustbin Overflow Alert',
      location: 'Meenakshi Amman Temple Gate',
      status: 'Pending',
      type: 'Sensor',
      wardId: 'ward-1',
      zoneId: 'Zone 4 (Vaikunth Nagar)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      name: 'Private Waste Collection',
      location: 'House #45, Anna Nagar',
      status: 'Pending',
      type: 'Citizen Private',
      assignedTo: 'Team 04',
      wardId: 'ward-1',
      zoneId: 'Zone 4 (Vaikunth Nagar)',
      createdAt: new Date().toISOString(),
    }
  ],
  sensorAlerts: [
    {
      id: 'alert-1',
      type: 'Dustbin Overflow',
      location: 'Railway Station North',
      wardId: 'ward-1',
      zoneId: 'Zone 4 (Vaikunth Nagar)',
      timestamp: new Date().toISOString(),
    }
  ],
  attendance: {},
  setCurrentUser: (user) => set({ currentUser: user }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
  })),
  addAlert: (alert) => set((state) => ({ sensorAlerts: [alert, ...state.sensorAlerts] })),
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
